import { Action, ActionProcessor, ActionRequester, CrossModuleMessage } from '../../types';
import { QueueActionType } from './QueueActionType';

export type QueueMessage<T> = CrossModuleMessage<T> & {
  /** FIFO queues only: message group for ordering. Defaults to the queue name (global ordering). */
  groupId?: string;

  /** FIFO queues only: dedup id (5-min SQS window). Defaults to a generated uuid (no dedup). */
  deduplicationId?: string;
};

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
