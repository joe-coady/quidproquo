import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ConfigActionType } from './ConfigActionType';

// Action
export interface ConfigListParametersAction extends Action<void> {
  type: ConfigActionType.ListParameters;
}

// Function Types
export type ConfigListParametersActionProcessor = ActionProcessor<ConfigListParametersAction, string[]>;
export type ConfigListParametersActionRequester = ActionRequester<ConfigListParametersAction, string[]>;
