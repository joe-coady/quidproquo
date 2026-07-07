import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QpqIsoDateTime } from '../../types/QpqIsoDateTime';
import { DateActionType } from './DateActionType';

// Payload
export type DateNowActionPayload = undefined;

// Action
export interface DateNowAction extends Action<DateNowActionPayload> {
  type: DateActionType.Now;
}

// Function Types
export type DateNowActionProcessor = ActionProcessor<DateNowAction, QpqIsoDateTime>;
export type DateNowActionRequester = ActionRequester<DateNowAction, QpqIsoDateTime>;
