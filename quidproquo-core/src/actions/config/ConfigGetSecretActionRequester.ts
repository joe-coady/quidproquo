import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigGetSecretActionRequester } from './ConfigGetSecretActionTypes';

export const ConfigGetSecretErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetSecret, [
  'ResourceNotFound',
  'Throttling',
]);

export function* askConfigGetSecret(secretName: string): ConfigGetSecretActionRequester {
  return yield { type: ConfigActionType.GetSecret, payload: { secretName } };
}
