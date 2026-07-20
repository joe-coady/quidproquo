import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileGenerateTemporaryUploadSecureUrlActionPayload {
  drive: string;
  filepath: string;
  expirationMs: number;
  // maxSizeBytes?: number;
  contentType?: string;
  // Content-Disposition to bake into the upload so the stored object serves with it (e.g. 'inline'
  // so a PDF previews in an <iframe> instead of force-downloading). On S3 it is signed into the PUT
  // (the client must send the matching header); the dev store persists it as sidecar metadata.
  contentDisposition?: string;
  scope?: string;
}

// Action
export interface FileGenerateTemporaryUploadSecureUrlAction extends Action<FileGenerateTemporaryUploadSecureUrlActionPayload> {
  type: FileActionType.GenerateTemporaryUploadSecureUrl;
  payload: FileGenerateTemporaryUploadSecureUrlActionPayload;
}

// Function Types
export type FileGenerateTemporaryUploadSecureUrlActionProcessor = ActionProcessor<FileGenerateTemporaryUploadSecureUrlAction, string>;
export type FileGenerateTemporaryUploadSecureUrlActionRequester = ActionRequester<FileGenerateTemporaryUploadSecureUrlAction, string>;
