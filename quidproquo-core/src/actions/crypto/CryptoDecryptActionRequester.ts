import { createErrorEnumForAction } from '../../types';
import { CryptoActionType } from './CryptoActionType';
import { CryptoContext } from './CryptoContext';
import { CryptoDecryptActionRequester } from './CryptoDecryptActionTypes';

export const CryptoDecryptErrorTypeEnum = createErrorEnumForAction(CryptoActionType.Decrypt, [
  'KeyNotConfigured', // no defineCryptoKey for keyName in the service config
  'ContextMismatch', // supplied context differs from the encrypt-time context; probable scoping bug, do not retry
  'MalformedCiphertext', // ciphertext is corrupt, truncated, or not a qpq crypto blob
  'KeyUnavailable', // key disabled, deleted, or access denied
  'Throttling', // request rate exceeded
]);

export function* askCryptoDecrypt(keyName: string, ciphertext: string, context?: CryptoContext): CryptoDecryptActionRequester {
  return yield { type: CryptoActionType.Decrypt, payload: { keyName, ciphertext, context } };
}
