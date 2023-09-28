import { QPQBinaryData } from '../../types/QPQBinaryData';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, DriveName, StorageDriveAdvancedWriteOptions } from './FileActionType';

// Payload
export interface FileWriteBinaryContentsActionPayload {
  drive: DriveName;
  filepath: string;
  data: QPQBinaryData;

  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions;
}

// Action
export interface FileWriteBinaryContentsAction
  extends Action<FileWriteBinaryContentsActionPayload> {
  type: FileActionType.WriteBinaryContents;
  payload: FileWriteBinaryContentsActionPayload;
}

// Function Types
export type FileWriteBinaryContentsActionProcessor = ActionProcessor<
  FileWriteBinaryContentsAction,
  void
>;
export type FileWriteBinaryContentsActionRequester = ActionRequester<
  FileWriteBinaryContentsAction,
  void
>;
