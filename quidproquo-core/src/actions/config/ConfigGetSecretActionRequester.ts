import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigGetSecretActionRequester } from './ConfigGetSecretActionTypes';

export const ConfigGetSecretErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetSecret, [
  'ResourceNotFound', // secret does not exist
  'Throttling', // request rate exceeded
]);

export function* askConfigGetSecret(secretName: string): ConfigGetSecretActionRequester {
  return yield { type: ConfigActionType.GetSecret, payload: { secretName } };
}
