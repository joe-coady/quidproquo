import { QueueActionType } from './QueueActionType';
import { QueueSendMessageActionRequester, QueueMessage } from './QueueSendMessageActionTypes';

export function* askQueueSendMessages<T extends QueueMessage<any>>(
  queueName: string,
  ...queueMessages: T[]
): QueueSendMessageActionRequester<T> {
  return yield {
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
