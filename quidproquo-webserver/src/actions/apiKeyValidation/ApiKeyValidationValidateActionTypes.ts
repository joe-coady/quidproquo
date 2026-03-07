import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { ApiKeyReference } from '../../config/settings/apiKey';
import { ApiKeyValidationActionType } from './ApiKeyValidationActionType';

// Payload
export interface ApiKeyValidationValidateActionPayload {
  apiKeyValue: string;
  apiKeyReferences: ApiKeyReference[];
}

// Action
export interface ApiKeyValidationValidateAction extends Action<ApiKeyValidationValidateActionPayload> {
  type: ApiKeyValidationActionType.Validate;
  payload: ApiKeyValidationValidateActionPayload;
}

// Function Types
export type ApiKeyValidationValidateActionProcessor = ActionProcessor<ApiKeyValidationValidateAction, boolean>;
export type ApiKeyValidationValidateActionRequester = ActionRequester<ApiKeyValidationValidateAction, boolean>;
