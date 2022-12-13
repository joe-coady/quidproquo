import { ConfigGetSecretActionRequester } from './ConfigGetSecretActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigGetSecret(secretName: string): ConfigGetSecretActionRequester {
  return yield { type: ConfigActionType.GetSecret, payload: { secretName } };
}
