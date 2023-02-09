import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QueueActionType } from './QueueActionType';

export interface QueueMessage<T = null> {
  type: string;
  payload: T;
}

// Payload
export interface QueueSendMessageActionPayload<T> {
  queueName: string;
  queueMessages: QueueMessage<T>[];
}

// Action
export interface QueueSendMessageAction<T> extends Action<QueueSendMessageActionPayload<T>> {
  type: QueueActionType.SendMessages;
  payload: QueueSendMessageActionPayload<T>;
}

// Function Types
export type QueueSendMessageActionProcessor<T> = ActionProcessor<QueueSendMessageAction<T>, void>;
export type QueueSendMessageActionRequester<T> = ActionRequester<QueueSendMessageAction<T>, void>;
