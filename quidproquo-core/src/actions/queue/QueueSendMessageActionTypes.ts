import { Action, ActionProcessor, ActionRequester, CrossModuleMessage, QpqContext } from '../../types';
import { ContextListAction, ContextReadAction } from '../context';
import { QueueActionType } from './QueueActionType';

export type QueueMessage<T> = CrossModuleMessage<T>;

// Payload
export interface QueueSendMessageActionPayload<T> {
  queueName: string;
  queueMessages: QueueMessage<T>[];
  context: QpqContext<any>;
}

// Action
export interface QueueSendMessageAction<T> extends Action<QueueSendMessageActionPayload<T>> {
  type: QueueActionType.SendMessages;
  payload: QueueSendMessageActionPayload<T>;
}

// Function Types
export type QueueSendMessageActionProcessor<T> = ActionProcessor<QueueSendMessageAction<T>, void>;
export type QueueSendMessageActionRequester<T> = ActionRequester<QueueSendMessageAction<T> | ContextListAction, void, QpqContext<any> | void>;
