import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QueueActionType } from './QueueActionType';

// Payload
export interface QueueSendMessageActionPayload<T> {
  queueName: string;
  type: string;
  payload: T;
}

// Action
export interface QueueSendMessageAction<T> extends Action<QueueSendMessageActionPayload<T>> {
  type: QueueActionType.SendMessage;
  payload: QueueSendMessageActionPayload<T>;
}

// Function Types
export type QueueSendMessageActionProcessor<T> = ActionProcessor<QueueSendMessageAction<T>, void>;
export type QueueSendMessageActionRequester<T> = ActionRequester<QueueSendMessageAction<T>, void>;
