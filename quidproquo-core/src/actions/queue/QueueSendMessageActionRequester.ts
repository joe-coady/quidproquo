import { QueueActionType } from './QueueActionType';
import { QueueSendMessageActionRequester } from './QueueSendMessageActionTypes';

export function* askQueueSendMessage<T>(
  queueName: string,
  type: string,
  payload: T,
): QueueSendMessageActionRequester<T> {
  return yield {
    type: QueueActionType.SendMessage,
    payload: {
      type,
      payload,
      queueName,
    },
  };
}
