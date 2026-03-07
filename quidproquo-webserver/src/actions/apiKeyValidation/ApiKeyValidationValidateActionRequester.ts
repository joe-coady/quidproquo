import { ApiKeyReference } from '../../config/settings/apiKey';
import { ApiKeyValidationActionType } from './ApiKeyValidationActionType';
import { ApiKeyValidationValidateActionRequester } from './ApiKeyValidationValidateActionTypes';

export function* askApiKeyValidationValidate(
  apiKeyValue: string,
  apiKeyReferences: ApiKeyReference[],
): ApiKeyValidationValidateActionRequester {
  return yield {
    type: ApiKeyValidationActionType.Validate,
    payload: {
      apiKeyValue,
      apiKeyReferences,
    },
  };
}
