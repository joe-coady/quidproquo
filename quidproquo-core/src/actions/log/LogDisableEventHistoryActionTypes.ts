import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { LogActionType } from './LogActionType';

// Payload
export interface LogDisableEventHistoryActionPayload {
  enable: boolean;
  reason: string;
}

// Action
export interface LogDisableEventHistoryAction extends Action<LogDisableEventHistoryActionPayload> {
  type: LogActionType.DisableEventHistory;
  payload: LogDisableEventHistoryActionPayload;
}

// Function Types
export type LogDisableEventHistoryActionProcessor = ActionProcessor<LogDisableEventHistoryAction, void>;
export type LogDisableEventHistoryActionRequester = ActionRequester<LogDisableEventHistoryAction, void>;
