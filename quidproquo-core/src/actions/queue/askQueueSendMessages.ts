import { AskResponse } from '../../types/StorySession';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { QueueActionType } from './QueueActionType';
import { QueueMessage } from './QueueSendMessageActionTypes';

export const askQueueSendMessagesBase = createActionRequester<void>()({
  actionType: QueueActionType.SendMessages,
  errorTypes: [
    'AccessDenied', // caller lacks permission to send to the queue
    'QueueNotFound', // the SQS queue does not exist
    'ServiceUnavailable', // SQS internal error / throttling
  ],
  getPayload: (queueName: string, queueMessages: QueueMessage<any>[]) => ({ queueMessages, queueName }),
});

// Generic so callers can pin the message body shape at the call site.
export function* askQueueSendMessages<T extends QueueMessage<any>>(queueName: string, ...queueMessages: T[]): AskResponse<void> {
  return yield* askQueueSendMessagesBase(queueName, queueMessages);
}
