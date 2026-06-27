import { ContextActionType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { WebsocketActionType } from '../../../../actions/websocket/WebsocketActionType';
import { askSendMessage } from './askSendMessage';

describe('askSendMessage', () => {
  it('sends the payload over the websocket using the connection-info api name', () => {
    let captured: any;

    runStory(askSendMessage('c1', { type: 'anything' } as any), {
      [ContextActionType.Read]: { apiName: 'demo' },
      [WebsocketActionType.SendMessage]: (action: any) => {
        captured = action;
        return undefined;
      },
    });

    expect(captured.payload).toEqual({
      websocketApiName: 'demo',
      connectionId: 'c1',
      payload: { type: 'anything' },
    });
  });
});
