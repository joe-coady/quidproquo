import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { EventBusActionType } from './EventBusActionType';
import { askEventBusSendMessages } from './EventBusSendMessageActionRequester';

describe('askEventBusSendMessages', () => {
  it('yields a SendMessages action with the supplied options as payload', () => {
    const options = { eventBusName: 'bus', messages: [{ value: 1 }] } as any;

    const { action } = captureRequester(askEventBusSendMessages(options));

    expect(action).toEqual({
      type: EventBusActionType.SendMessages,
      payload: options,
    });
  });
});
