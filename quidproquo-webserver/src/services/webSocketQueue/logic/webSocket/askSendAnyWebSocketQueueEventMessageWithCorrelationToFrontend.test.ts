import { ContextActionType, KeyValueStoreActionType, runStory, throwsError } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { WebsocketActionType } from '../../../../actions/websocket/WebsocketActionType';
import { askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend } from './askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend';

const message = { type: 'some-event', correlationId: 'corr' } as any;

describe('askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend', () => {
  it('sends directly to the connection when the send succeeds', () => {
    const sends: any[] = [];

    runStory(askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(message, 'direct'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.connectionId);
        return undefined;
      },
    });

    expect(sends).toEqual(['direct']);
  });

  it('fills the correlation id from the connection info when the payload lacks one', () => {
    let captured: any;

    runStory(askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend({ type: 'some-event' } as any, 'direct'), {
      [ContextActionType.Read]: { apiName: 'demo', correlationId: 'from-context' },
      [WebsocketActionType.SendMessage]: (action: any) => {
        captured = action;
        return undefined;
      },
    });

    expect(captured.payload.payload.correlationId).toBe('from-context');
  });

  it('falls back to the user connections when the direct send fails and a user is given', () => {
    const sends: any[] = [];

    runStory(askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(message, 'direct', 'u1'), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Query]: { items: [{ id: 'user-conn' }] },
      [WebsocketActionType.SendMessage]: (action: any) => {
        const connectionId = action.payload.connectionId;
        sends.push(connectionId);
        if (connectionId === 'direct') {
          return throwsError('Disconnected', 'gone');
        }
        return undefined;
      },
    });

    expect(sends).toEqual(['direct', 'user-conn']);
  });

  it('broadcasts to everyone when neither a connection nor a user is given', () => {
    const sends: any[] = [];

    runStory(askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(message), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [KeyValueStoreActionType.Scan]: { items: [{ id: 'a' }, { id: 'b' }] },
      [WebsocketActionType.SendMessage]: (action: any) => {
        sends.push(action.payload.connectionId);
        return undefined;
      },
    });

    expect(sends).toEqual(['a', 'b']);
  });
});
