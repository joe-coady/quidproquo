import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { CryptoActionType } from './CryptoActionType';
import { CryptoContext } from './CryptoContext';

// Payload
export interface CryptoDecryptActionPayload {
  keyName: string;
  ciphertext: string;
  context?: CryptoContext;
}

// Action
export interface CryptoDecryptAction extends Action<CryptoDecryptActionPayload> {
  type: CryptoActionType.Decrypt;
  payload: CryptoDecryptActionPayload;
}

// Function Types
export type CryptoDecryptActionProcessor = ActionProcessor<CryptoDecryptAction, string>;
export type CryptoDecryptActionRequester = ActionRequester<CryptoDecryptAction, string>;
