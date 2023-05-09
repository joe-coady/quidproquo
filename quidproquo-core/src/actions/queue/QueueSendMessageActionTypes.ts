import { Action, ActionProcessor, ActionRequester, CrossModuleMessage } from '../../types';
import { QueueActionType } from './QueueActionType';

export type QueueMessage<T> = CrossModuleMessage<T>;

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
