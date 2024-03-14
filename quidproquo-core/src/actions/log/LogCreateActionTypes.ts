import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { LogActionType } from './LogActionType';
import { LogLevelEnum } from '../../types/LogLevelEnum';

// Payload
export interface LogCreateActionPayload {
  logLevel: LogLevelEnum;
  msg: string;
  data?: any;
}

// Action
export interface LogCreateAction extends Action<LogCreateActionPayload> {
  type: LogActionType.Create;
  payload: LogCreateActionPayload;
}

// Function Types
export type LogCreateActionProcessor = ActionProcessor<LogCreateAction, void>;
export type LogCreateActionRequester = ActionRequester<LogCreateAction, void>;
