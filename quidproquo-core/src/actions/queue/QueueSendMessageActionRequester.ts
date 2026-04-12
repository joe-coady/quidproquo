import { QueueActionType } from './QueueActionType';
import { QueueMessage, QueueSendMessageActionRequester } from './QueueSendMessageActionTypes';

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
