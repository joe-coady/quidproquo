import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Payload
export interface ConfigSetParameterActionPayload {
  parameterName: string;
  parameterValue: string;
}

// Action
export interface ConfigSetParameterAction extends Action<ConfigSetParameterActionPayload> {
  type: ConfigActionType.SetParameter;
  payload: ConfigSetParameterActionPayload;
}

// Function Types
export type ConfigSetParameterActionProcessor = ActionProcessor<ConfigSetParameterAction, void>;
export type ConfigSetParameterActionRequester = ActionRequester<ConfigSetParameterAction, void>;
