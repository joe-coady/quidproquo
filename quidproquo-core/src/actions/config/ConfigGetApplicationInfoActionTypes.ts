import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

export interface ApplicationConfigInfo {
  name: string;
  environment: string;
  module: string;
  feature?: string;
}

// Payload
export type ConfigGetApplicationInfoActionPayload = undefined;

// Action
export interface ConfigGetApplicationInfoAction extends Action<ConfigGetApplicationInfoActionPayload> {
  type: ConfigActionType.GetApplicationInfo;
}

// Function Types
export type ConfigGetApplicationInfoActionProcessor = ActionProcessor<ConfigGetApplicationInfoAction, ApplicationConfigInfo>;
export type ConfigGetApplicationInfoActionRequester = ActionRequester<ConfigGetApplicationInfoAction, ApplicationConfigInfo>;
