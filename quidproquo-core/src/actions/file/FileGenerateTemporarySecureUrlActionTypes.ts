import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileGenerateTemporarySecureUrlActionPayload {
  drive: string;
  filepath: string;
  expirationMs: number;
}

// Action
export interface FileGenerateTemporarySecureUrlAction extends Action<FileGenerateTemporarySecureUrlActionPayload> {
  type: FileActionType.GenerateTemporarySecureUrl;
  payload: FileGenerateTemporarySecureUrlActionPayload;
}

// Function Types
export type FileGenerateTemporarySecureUrlActionProcessor = ActionProcessor<FileGenerateTemporarySecureUrlAction, string>;
export type FileGenerateTemporarySecureUrlActionRequester = ActionRequester<FileGenerateTemporarySecureUrlAction, string>;
