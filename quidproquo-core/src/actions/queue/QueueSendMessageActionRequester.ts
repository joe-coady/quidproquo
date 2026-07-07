import { createErrorEnumForAction } from '../../types';
import { QueueActionType } from './QueueActionType';
import { QueueMessage, QueueSendMessageActionRequester } from './QueueSendMessageActionTypes';

export const QueueSendMessagesErrorTypeEnum = createErrorEnumForAction(QueueActionType.SendMessages, [
  'AccessDenied', // caller lacks permission to send to the queue
  'QueueNotFound', // the SQS queue does not exist
  'ServiceUnavailable', // SQS internal error / throttling
]);

export function* askQueueSendMessages<T extends QueueMessage<any>>(queueName: string, ...queueMessages: T[]): QueueSendMessageActionRequester<T> {
  yield {
    type: QueueActionType.SendMessages,
    payload: {
      queueMessages,
      queueName,
    },
  };
}

// export function* askQueueSendMessagesUnordered<T>(
//   queueName: string,
//   ...queueMessages: QueueMessage<T>[]
// ): QueueSendMessageActionRequester<T> {
//   // Breakup the messages in batches of 10
//   const batches = [];
// }
