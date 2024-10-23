import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';

// Payload
export interface FileWriteBinaryContentsActionPayload {
  drive: string;
  filepath: string;
  data: QPQBinaryData;

  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions;
}

// Action
export interface FileWriteBinaryContentsAction extends Action<FileWriteBinaryContentsActionPayload> {
  type: FileActionType.WriteBinaryContents;
  payload: FileWriteBinaryContentsActionPayload;
}

// Function Types
export type FileWriteBinaryContentsActionProcessor = ActionProcessor<FileWriteBinaryContentsAction, void>;
export type FileWriteBinaryContentsActionRequester = ActionRequester<FileWriteBinaryContentsAction, void>;
