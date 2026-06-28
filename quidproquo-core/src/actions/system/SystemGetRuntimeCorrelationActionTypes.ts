import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { SystemActionType } from './SystemActionType';

// Payload
export type SystemGetRuntimeCorrelationActionPayload = undefined;

// Action
export interface SystemGetRuntimeCorrelationAction extends Action<SystemGetRuntimeCorrelationActionPayload> {
  type: SystemActionType.GetRuntimeCorrelation;
}

// Function Types
export type SystemGetRuntimeCorrelationActionProcessor = ActionProcessor<SystemGetRuntimeCorrelationAction, string>;
export type SystemGetRuntimeCorrelationActionRequester = ActionRequester<SystemGetRuntimeCorrelationAction, string>;
