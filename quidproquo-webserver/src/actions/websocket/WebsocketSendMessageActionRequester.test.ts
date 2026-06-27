import { captureRequester } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { WebsocketActionType } from './WebsocketActionType';
import { askWebsocketSendMessage, WebsocketSendMessageErrorTypeEnum } from './WebsocketSendMessageActionRequester';

describe('askWebsocketSendMessage', () => {
  it('yields a SendMessage action with the api name, connection id and payload', () => {
    const { action } = captureRequester(askWebsocketSendMessage('api', 'conn-1', { hello: 'world' }));

    expect(action).toEqual({
      type: WebsocketActionType.SendMessage,
      payload: { websocketApiName: 'api', connectionId: 'conn-1', payload: { hello: 'world' } },
    });
  });
});

describe('WebsocketSendMessageErrorTypeEnum', () => {
  it('namespaces each error name under the SendMessage action type', () => {
    expect(WebsocketSendMessageErrorTypeEnum.Throttled).toBe(`${WebsocketActionType.SendMessage}-Throttled`);
    expect(WebsocketSendMessageErrorTypeEnum.Disconnected).toBe(`${WebsocketActionType.SendMessage}-Disconnected`);
  });
});
