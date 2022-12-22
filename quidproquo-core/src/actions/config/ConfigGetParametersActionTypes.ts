import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Payload
export interface ConfigGetParametersActionPayload {
  parameterNames: string[];
}

// Action
export interface ConfigGetParametersAction extends Action<ConfigGetParametersActionPayload> {
  type: ConfigActionType.GetParameters;
  payload: ConfigGetParametersActionPayload;
}

// Function Types
export type ConfigGetParametersActionProcessor = ActionProcessor<
  ConfigGetParametersAction,
  string[]
>;
export type ConfigGetParametersActionRequester = ActionRequester<
  ConfigGetParametersAction,
  string[]
>;
