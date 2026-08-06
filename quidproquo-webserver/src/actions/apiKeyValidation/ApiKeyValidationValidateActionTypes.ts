import { ApiKeyReference } from '../../config/settings/apiKey';
import { ApiKeyValidationActionType } from './ApiKeyValidationActionType';

// Payload
export interface ApiKeyValidationValidateActionPayload {
  apiKeyValue: string;
  apiKeyReferences: ApiKeyReference[];
}
