import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Payload
export interface ConfigGetParameterActionPayload {
  parameterName: string;
}

// Action
export interface ConfigGetParameterAction extends Action<ConfigGetParameterActionPayload> {
  type: ConfigActionType.GetParameter;
  payload: ConfigGetParameterActionPayload;
}

// Function Types
export type ConfigGetParameterActionProcessor = ActionProcessor<ConfigGetParameterAction, string>;
export type ConfigGetParameterActionRequester = ActionRequester<ConfigGetParameterAction, string>;
