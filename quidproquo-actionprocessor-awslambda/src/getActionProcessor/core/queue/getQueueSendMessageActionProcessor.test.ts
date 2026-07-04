import { defineAwsServiceAccountInfo } from 'quidproquo-config-aws';
import { buildTestQpqConfig, buildTestStorySession, QueueActionType } from 'quidproquo-core';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendMessages } from '../../../logic/sqs/sendMessages';
import { invokeProcessor } from '../../../testing/processorTestHelpers';
import { getQueueSendMessagesActionProcessor } from './getQueueSendMessageActionProcessor';

vi.mock('../../../logic/sqs/sendMessages', () => ({
  sendMessages: vi.fn(),
}));

const resolveProcessor = async () => {
  const config = buildTestQpqConfig([defineAwsServiceAccountInfo('111', 'eu-west-1')]);
  const processors = await getQueueSendMessagesActionProcessor(config, {} as any);
  return processors[QueueActionType.SendMessages];
};

describe('getQueueSendMessagesActionProcessor', () => {
  beforeEach(() => {
    vi.mocked(sendMessages).mockReset();
  });

  it('sends each message to the resolved queue with the session attached', async () => {
    const processor = await resolveProcessor();

    const result = await invokeProcessor(
      processor,
      { queueName: 'jobs', queueMessages: [{ payload: { a: 1 } }] },
      { session: buildTestStorySession() },
    );

    expect(result).toEqual([undefined]);
    const [queueName, region, bodies] = vi.mocked(sendMessages).mock.calls[0];
    expect(queueName).toBe('jobs-test-app-test-module-development');
    expect(region).toBe('eu-west-1');
    expect(JSON.parse(bodies[0])).toEqual({ payload: { a: 1 }, storySession: buildTestStorySession() });
  });
});
