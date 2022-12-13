import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Payload
export interface ConfigGetSecretActionPayload {
  secretName: string;
}

// Action
export interface ConfigGetSecretAction extends Action<ConfigGetSecretActionPayload> {
  type: ConfigActionType.GetSecret;
  payload: ConfigGetSecretActionPayload;
}

// Function Types
export type ConfigGetSecretActionProcessor = ActionProcessor<ConfigGetSecretAction, string>;
export type ConfigGetSecretActionRequester = ActionRequester<ConfigGetSecretAction, string>;
