import { ActionProcessorList, ActionProcessorListResolver, actionResult, QPQConfig } from 'quidproquo-core';
import { ApiKeyValidationActionType, ApiKeyValidationValidateActionProcessor } from 'quidproquo-webserver';

const getProcessApiKeyValidationValidate = (_qpqConfig: QPQConfig): ApiKeyValidationValidateActionProcessor => {
  return async () => {
    // Permissive dev mode - always return true
    return actionResult(true);
  };
};

export const getApiKeyValidationValidateActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [ApiKeyValidationActionType.Validate]: getProcessApiKeyValidationValidate(qpqConfig),
});
