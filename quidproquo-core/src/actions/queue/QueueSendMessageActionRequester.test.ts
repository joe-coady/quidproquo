import { describe, expect, it } from 'vitest';

import { captureRequester } from '../../testing';
import { QueueActionType } from './QueueActionType';
import { askQueueSendMessages } from './QueueSendMessageActionRequester';

describe('askQueueSendMessages', () => {
  it('yields a SendMessages action with the queue name and collected messages', () => {
    const m1 = { body: { a: 1 } } as any;
    const m2 = { body: { a: 2 } } as any;

    const { action } = captureRequester(askQueueSendMessages('my-queue', m1, m2));

    expect(action).toEqual({
      type: QueueActionType.SendMessages,
      payload: {
        queueName: 'my-queue',
        queueMessages: [m1, m2],
      },
    });
  });

  it('yields an empty queueMessages array when none are given', () => {
    const { action } = captureRequester(askQueueSendMessages('my-queue'));

    expect(action).toEqual({
      type: QueueActionType.SendMessages,
      payload: {
        queueName: 'my-queue',
        queueMessages: [],
      },
    });
  });
});
