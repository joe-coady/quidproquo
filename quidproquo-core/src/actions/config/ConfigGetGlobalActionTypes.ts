import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Payload
export interface ConfigGetGlobalActionPayload {
  globalName: string;
}

// Action
export interface ConfigGetGlobalAction extends Action<ConfigGetGlobalActionPayload> {
  type: ConfigActionType.GetGlobal;
  payload: ConfigGetGlobalActionPayload;
}

// Function Types
export type ConfigGetGlobalActionProcessor<T> = ActionProcessor<ConfigGetGlobalAction, T>;
export type ConfigGetGlobalActionRequester<T> = ActionRequester<ConfigGetGlobalAction, T>;
