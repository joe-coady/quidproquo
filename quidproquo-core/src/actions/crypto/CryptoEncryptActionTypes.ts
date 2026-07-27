import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { CryptoActionType } from './CryptoActionType';
import { CryptoContext } from './CryptoContext';

// Payload
export interface CryptoEncryptActionPayload {
  keyName: string;
  plaintext: string;
  context?: CryptoContext;
}

// Action
export interface CryptoEncryptAction extends Action<CryptoEncryptActionPayload> {
  type: CryptoActionType.Encrypt;
  payload: CryptoEncryptActionPayload;
}

// Function Types
export type CryptoEncryptActionProcessor = ActionProcessor<CryptoEncryptAction, string>;
export type CryptoEncryptActionRequester = ActionRequester<CryptoEncryptAction, string>;
