import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { DateActionType } from './DateActionType';

// Payload
export type DateNowActionPayload = undefined;

// Action
export interface DateNowAction extends Action<DateNowActionPayload> {
  type: DateActionType.Now;
}

// Function Types
export type DateNowActionProcessor = ActionProcessor<DateNowAction, string>;
export type DateNowActionRequester = ActionRequester<DateNowAction, string>;
