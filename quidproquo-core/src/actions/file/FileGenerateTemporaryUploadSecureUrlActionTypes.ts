import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileGenerateTemporaryUploadSecureUrlActionPayload {
  drive: string;
  filepath: string;
  expirationMs: number;
  // maxSizeBytes?: number;
  contentType?: string;
}

// Action
export interface FileGenerateTemporaryUploadSecureUrlAction extends Action<FileGenerateTemporaryUploadSecureUrlActionPayload> {
  type: FileActionType.GenerateTemporaryUploadSecureUrl;
  payload: FileGenerateTemporaryUploadSecureUrlActionPayload;
}

// Function Types
export type FileGenerateTemporaryUploadSecureUrlActionProcessor = ActionProcessor<FileGenerateTemporaryUploadSecureUrlAction, string>;
export type FileGenerateTemporaryUploadSecureUrlActionRequester = ActionRequester<FileGenerateTemporaryUploadSecureUrlAction, string>;
