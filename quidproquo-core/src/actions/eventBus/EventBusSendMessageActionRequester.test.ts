import { describe, expect, it } from 'vitest';

import { captureRequester, runStory, StoryError, throwsError } from '../../testing';
import { EventBusActionType } from './EventBusActionType';
import { askEventBusSendMessages, EventBusSendMessagesErrorTypeEnum } from './EventBusSendMessageActionRequester';
import { EventBusSendMessageOptions } from './EventBusSendMessageActionTypes';

describe('askEventBusSendMessages', () => {
  it('yields a SendMessages action with the supplied options as payload', () => {
    const options: EventBusSendMessageOptions<{ value: number }> = {
      eventBusName: 'bus',
      eventBusMessages: [{ type: 'thing.happened', payload: { value: 1 } }],
    };

    const { action } = captureRequester(askEventBusSendMessages(options));

    expect(action).toEqual({
      type: EventBusActionType.SendMessages,
      payload: options,
    });
  });

  it('passes FIFO groupId and deduplicationId through on the message', () => {
    const options: EventBusSendMessageOptions<null> = {
      eventBusName: 'bus',
      eventBusMessages: [{ type: 'thing.happened', payload: null, groupId: 'g1', deduplicationId: 'd1' }],
    };

    const { action } = captureRequester(askEventBusSendMessages(options));

    expect(action.payload.eventBusMessages[0]).toEqual({ type: 'thing.happened', payload: null, groupId: 'g1', deduplicationId: 'd1' });
  });

  it('propagates a processor failure as a thrown StoryError', () => {
    const runFailingStory = () =>
      runStory(askEventBusSendMessages({ eventBusName: 'missing-bus', eventBusMessages: [{ type: 'thing.happened', payload: {} }] }), {
        [EventBusActionType.SendMessages]: throwsError(EventBusSendMessagesErrorTypeEnum.TopicNotFound, 'Topic does not exist'),
      });

    expect(runFailingStory).toThrow(StoryError);
    expect(runFailingStory).toThrow(`${EventBusSendMessagesErrorTypeEnum.TopicNotFound}: Topic does not exist`);
  });
});

describe('EventBusSendMessagesErrorTypeEnum', () => {
  it('lists every error the processor can produce, namespaced by the action type', () => {
    expect(EventBusSendMessagesErrorTypeEnum).toEqual({
      AccessDenied: `${EventBusActionType.SendMessages}-AccessDenied`,
      TopicNotFound: `${EventBusActionType.SendMessages}-TopicNotFound`,
      ServiceUnavailable: `${EventBusActionType.SendMessages}-ServiceUnavailable`,
    });
  });
});
