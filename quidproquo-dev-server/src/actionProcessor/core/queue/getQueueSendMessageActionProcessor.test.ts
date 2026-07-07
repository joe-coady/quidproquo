import {
  buildTestQpqConfig,
  defineQueue,
  ErrorTypeEnum,
  isErroredActionResult,
  noopDynamicModuleLoader,
  QueueActionType,
  resolveActionResult,
  resolveActionResultError,
} from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '../../../logic/eventBus';
import { invokeProcessor } from '../../../testing/testProcessorRuntime';
import { getQueueSendMessagesActionProcessor } from './getQueueSendMessageActionProcessor';

vi.mock('../../../logic/eventBus', () => ({
  eventBus: { publish: vi.fn(), publishAndWaitForResponse: vi.fn() },
}));

const buildConfig = () => buildTestQpqConfig([defineQueue('myQueue', {})]);

const getProcessor = async (config = buildConfig()) => {
  const processors = await getQueueSendMessagesActionProcessor(config, noopDynamicModuleLoader);
  return processors[QueueActionType.SendMessages];
};

describe('getQueueSendMessagesActionProcessor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns NotFound when the queue is unknown', async () => {
    const process = await getProcessor();

    const result = await invokeProcessor(process, { queueName: 'missing', queueMessages: [] });

    expect(isErroredActionResult(result)).toBe(true);
    expect(resolveActionResultError(result).errorType).toBe(ErrorTypeEnum.NotFound);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('publishes one message per queue message with a messageId', async () => {
    const process = await getProcessor();

    const result = await invokeProcessor(process, {
      queueName: 'myQueue',
      queueMessages: [
        { payload: { a: 1 }, type: 'x' },
        { payload: { a: 2 }, type: 'y' },
      ],
    });

    expect(resolveActionResult(result)).toBeUndefined();
    expect(eventBus.publish).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenCalledWith(
      QueueActionType.SendMessages,
      expect.objectContaining({
        payload: { a: 1 },
        type: 'x',
        queueName: 'myQueue',
        messageId: expect.any(String),
      }),
    );
  });
});
