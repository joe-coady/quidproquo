import { createErrorEnumForAction } from '../../types';
import { CryptoActionType } from './CryptoActionType';
import { CryptoContext } from './CryptoContext';
import { CryptoEncryptActionRequester } from './CryptoEncryptActionTypes';

export const CryptoEncryptErrorTypeEnum = createErrorEnumForAction(CryptoActionType.Encrypt, [
  'KeyNotConfigured', // no defineCryptoKey for keyName in the service config
  'KeyUnavailable', // key disabled, deleted, or access denied
  'Throttling', // request rate exceeded
]);

export function* askCryptoEncrypt(keyName: string, plaintext: string, context?: CryptoContext): CryptoEncryptActionRequester {
  return yield { type: CryptoActionType.Encrypt, payload: { keyName, plaintext, context } };
}
