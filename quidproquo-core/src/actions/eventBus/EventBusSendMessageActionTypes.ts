import { Action, ActionProcessor, ActionRequester, CrossModuleMessage } from '../../types';
import { EventBusActionType } from './EventBusActionType';

export type EventBusMessage<T> = CrossModuleMessage<T>;

export interface EventBusSendMessageOptions<T> {
  eventBusName: string;
  eventBusMessages: EventBusMessage<T>[];

  // Used to find the account it should exist in
  moduleOverride?: string;
  environmentOverride?: string;
  featureOverride?: string;
  applicationOverride?: string;
}

// Payload
export interface EventBusSendMessageActionPayload<T> extends EventBusSendMessageOptions<T> {}

// Action
export interface EventBusSendMessageAction<T> extends Action<EventBusSendMessageActionPayload<T>> {
  type: EventBusActionType.SendMessages;
  payload: EventBusSendMessageActionPayload<T>;
}

// Function Types
export type EventBusSendMessageActionProcessor<T> = ActionProcessor<
  EventBusSendMessageAction<T>,
  void
>;
export type EventBusSendMessageActionRequester<T> = ActionRequester<
  EventBusSendMessageAction<T>,
  void
>;
