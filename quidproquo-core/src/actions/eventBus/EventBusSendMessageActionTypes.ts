import { Action, ActionProcessor, ActionRequester, CrossModuleMessage } from '../../types';
import { EventBusActionType } from './EventBusActionType';

export type EventBusMessage<T> = CrossModuleMessage<T> & {
  /** FIFO event buses only: message group for ordering. Defaults to the event bus name (global ordering). */
  groupId?: string;

  /** FIFO event buses only: dedup id (5-min SNS window). Defaults to a generated uuid (no dedup). */
  deduplicationId?: string;
};

export interface EventBusSendMessageOptions<T> {
  eventBusName: string;
  eventBusMessages: EventBusMessage<T>[];
}

// Payload
export interface EventBusSendMessageActionPayload<T> extends EventBusSendMessageOptions<T> {}

// Action
export interface EventBusSendMessageAction<T> extends Action<EventBusSendMessageActionPayload<T>> {
  type: EventBusActionType.SendMessages;
  payload: EventBusSendMessageActionPayload<T>;
}

// Function Types
export type EventBusSendMessageActionProcessor<T> = ActionProcessor<EventBusSendMessageAction<T>, void>;
export type EventBusSendMessageActionRequester<T> = ActionRequester<EventBusSendMessageAction<T>, void>;
