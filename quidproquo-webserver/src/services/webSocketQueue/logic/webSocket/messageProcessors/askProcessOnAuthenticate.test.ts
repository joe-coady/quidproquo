import {
  ConfigActionType,
  ContextActionType,
  EventBusActionType,
  InlineFunctionActionType,
  KeyValueStoreActionType,
  runStory,
  throwsError,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { WebsocketActionType } from '../../../../../actions/websocket/WebsocketActionType';
import { WebSocketQueueClientMessageEventType, WebSocketQueueServerMessageEventType } from '../../../types';
import { askProcessOnAuthenticate, isWebSocketAuthenticateMessage } from './askProcessOnAuthenticate';

const connection = { id: 'c1', requestTime: 't', requestTimeEpoch: 1, ip: '1.1.1.1' };

const globalByKey = (values: Record<string, string>) => (action: any) => values[action.payload.globalName] ?? '';

describe('isWebSocketAuthenticateMessage', () => {
  it('accepts an authenticate message', () => {
    expect(isWebSocketAuthenticateMessage({ type: WebSocketQueueClientMessageEventType.Authenticate } as any)).toBe(true);
  });

  it('rejects a non-authenticate message', () => {
    expect(isWebSocketAuthenticateMessage({ type: WebSocketQueueClientMessageEventType.Ping } as any)).toBe(false);
  });
});

describe('askProcessOnAuthenticate', () => {
  it('notifies the connection it is unauthenticated when the connection does not exist', () => {
    let setAccessTokenCalled = false;
    const sends: any[] = [];

    runStory(askProcessOnAuthenticate('c1', 'token-1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [] },
      [UserDirectoryActionType.SetAccessToken]: () => {
        setAccessTokenCalled = true;
        return { userId: 'u1' };
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
    });

    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Unauthenticated]);
    expect(setAccessTokenCalled).toBe(false);
  });

  it('does nothing when no user directory is configured', () => {
    let setAccessTokenCalled = false;

    runStory(askProcessOnAuthenticate('c1', 'token-1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [connection] },
      [ConfigActionType.GetGlobal]: '',
      [UserDirectoryActionType.SetAccessToken]: () => {
        setAccessTokenCalled = true;
        return { userId: 'u1' };
      },
    });

    expect(setAccessTokenCalled).toBe(false);
  });

  it('clears the connection auth and notifies it is unauthenticated when the token is invalid', () => {
    const sends: any[] = [];
    let upsert: any;

    runStory(askProcessOnAuthenticate('c1', 'bad-token'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [{ ...connection, userId: 'old-user', accessToken: 'old-token', tenantId: 'old-tenant' }] },
      [ConfigActionType.GetGlobal]: globalByKey({ 'qpq-wsq-kvs-name-demo': 'user-directory' }),
      [UserDirectoryActionType.SetAccessToken]: throwsError('Unauthorized', 'bad'),
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
    });

    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Unauthenticated]);
    expect(upsert.payload.item).toEqual(connection);
  });

  it('stores the user, confirms authentication and broadcasts the authenticate event', () => {
    let upsert: any;
    const sends: any[] = [];
    let broadcast: any;

    runStory(askProcessOnAuthenticate('c1', 'token-1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [connection] },
      [ConfigActionType.GetGlobal]: globalByKey({
        'qpq-wsq-kvs-name-demo': 'user-directory',
        'qpq-wsq-eb-name-demo': 'event-bus',
      }),
      [UserDirectoryActionType.SetAccessToken]: { userId: 'u1' },
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
      [EventBusActionType.SendMessages]: (action: any) => {
        broadcast = action;
        return undefined;
      },
    });

    expect(upsert.payload.item).toEqual({ ...connection, userId: 'u1', accessToken: 'token-1' });
    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Authenticated]);
    expect(broadcast.payload.eventBusName).toBe('event-bus');
    expect(broadcast.payload.eventBusMessages).toEqual([{ type: WebSocketQueueClientMessageEventType.Authenticate, payload: {} }]);
  });

  it('stores a validated tenant claim on the connection', () => {
    let upsert: any;
    let validatorCall: any;
    const sends: any[] = [];

    runStory(askProcessOnAuthenticate('c1', 'token-1', 'tenant-a'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [connection] },
      [ConfigActionType.GetGlobal]: globalByKey({
        'qpq-wsq-kvs-name-demo': 'user-directory',
        'qpq-wsq-eb-name-demo': 'event-bus',
        'qpq-wsq-scope-validator-demo': 'validateTenantScope',
      }),
      [UserDirectoryActionType.SetAccessToken]: { userId: 'u1' },
      [InlineFunctionActionType.Execute]: (action: any) => {
        validatorCall = action.payload;
        return true;
      },
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
      [EventBusActionType.SendMessages]: undefined,
    });

    expect(validatorCall).toEqual({ functionName: 'validateTenantScope', payload: { userId: 'u1', requestedScope: 'tenant-a' } });
    expect(upsert.payload.item.tenantId).toBe('tenant-a');
    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Authenticated]);
  });

  it('clears the connection auth when the tenant claim fails validation', () => {
    let upsert: any;
    const sends: any[] = [];

    runStory(askProcessOnAuthenticate('c1', 'token-1', 'tenant-b'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [{ ...connection, userId: 'old-user', accessToken: 'old-token', tenantId: 'old-tenant' }] },
      [ConfigActionType.GetGlobal]: globalByKey({
        'qpq-wsq-kvs-name-demo': 'user-directory',
        'qpq-wsq-scope-validator-demo': 'validateTenantScope',
      }),
      [UserDirectoryActionType.SetAccessToken]: { userId: 'u1' },
      [InlineFunctionActionType.Execute]: false,
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
    });

    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Unauthenticated]);
    expect(upsert.payload.item).toEqual(connection);
  });

  it('clears the connection auth when a tenant is claimed but no scope validator is configured', () => {
    let upsert: any;
    const sends: any[] = [];

    runStory(askProcessOnAuthenticate('c1', 'token-1', 'tenant-a'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [{ ...connection, userId: 'old-user', accessToken: 'old-token', tenantId: 'old-tenant' }] },
      [ConfigActionType.GetGlobal]: globalByKey({ 'qpq-wsq-kvs-name-demo': 'user-directory' }),
      [UserDirectoryActionType.SetAccessToken]: { userId: 'u1' },
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
    });

    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Unauthenticated]);
    expect(upsert.payload.item).toEqual(connection);
  });

  it('clears a previous tenant claim when re-authenticating without one', () => {
    let upsert: any;

    runStory(askProcessOnAuthenticate('c1', 'token-1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [{ ...connection, tenantId: 'tenant-a' }] },
      [ConfigActionType.GetGlobal]: globalByKey({
        'qpq-wsq-kvs-name-demo': 'user-directory',
        'qpq-wsq-eb-name-demo': 'event-bus',
      }),
      [UserDirectoryActionType.SetAccessToken]: { userId: 'u1' },
      [KeyValueStoreActionType.Upsert]: (action: any) => {
        upsert = action;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: undefined,
      [EventBusActionType.SendMessages]: undefined,
    });

    expect(upsert.payload.item.tenantId).toBeUndefined();
  });
});
