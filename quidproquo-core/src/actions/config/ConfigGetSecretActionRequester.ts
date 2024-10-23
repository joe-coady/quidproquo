import { ConfigActionType } from './ConfigActionType';
import { ConfigGetSecretActionRequester } from './ConfigGetSecretActionTypes';

export function* askConfigGetSecret(secretName: string): ConfigGetSecretActionRequester {
  return yield { type: ConfigActionType.GetSecret, payload: { secretName } };
}
