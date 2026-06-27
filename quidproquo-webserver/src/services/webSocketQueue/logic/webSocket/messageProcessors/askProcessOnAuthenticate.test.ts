import {
  ConfigActionType,
  ContextActionType,
  EventBusActionType,
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
  it('does nothing when the connection does not exist', () => {
    let setAccessTokenCalled = false;

    runStory(askProcessOnAuthenticate('c1', 'token-1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [] },
      [UserDirectoryActionType.SetAccessToken]: () => {
        setAccessTokenCalled = true;
        return { userId: 'u1' };
      },
    });

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

  it('notifies the connection it is unauthenticated when the token is invalid', () => {
    const sends: any[] = [];
    let upsertCalled = false;

    runStory(askProcessOnAuthenticate('c1', 'bad-token'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [connection] },
      [ConfigActionType.GetGlobal]: globalByKey({ 'qpq-wsq-kvs-name-demo': 'user-directory' }),
      [UserDirectoryActionType.SetAccessToken]: throwsError('Unauthorized', 'bad'),
      [KeyValueStoreActionType.Upsert]: () => {
        upsertCalled = true;
        return undefined;
      },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.payload.type);
        return undefined;
      },
    });

    expect(sends).toEqual([WebSocketQueueServerMessageEventType.Unauthenticated]);
    expect(upsertCalled).toBe(false);
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
    expect(broadcast.payload.eventBusMessages).toEqual([
      { type: WebSocketQueueClientMessageEventType.Authenticate, payload: {} },
    ]);
  });
});
