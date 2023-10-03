import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';

// Payload
export interface FileWriteTextContentsActionPayload {
  drive: string;
  filepath: string;
  data: string;
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions;
}

// Action
export interface FileWriteTextContentsAction extends Action<FileWriteTextContentsActionPayload> {
  type: FileActionType.WriteTextContents;
  payload: FileWriteTextContentsActionPayload;
}

// Function Types
export type FileWriteTextContentsActionProcessor = ActionProcessor<
  FileWriteTextContentsAction,
  void
>;
export type FileWriteTextContentsActionRequester = ActionRequester<
  FileWriteTextContentsAction,
  void
>;
