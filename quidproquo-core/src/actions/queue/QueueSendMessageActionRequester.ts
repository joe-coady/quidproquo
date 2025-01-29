import { ContextActionType } from '../context';
import { QueueActionType } from './QueueActionType';
import { QueueMessage, QueueSendMessageActionRequester } from './QueueSendMessageActionTypes';

export function* askQueueSendMessages<T extends QueueMessage<any>>(queueName: string, ...queueMessages: T[]): QueueSendMessageActionRequester<T> {
  // Read the context so we can send it with the queue message
  const context = (yield {
    type: ContextActionType.List,
  })!;

  yield {
    type: QueueActionType.SendMessages,
    payload: {
      queueMessages,
      queueName,
      context,
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
