import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';

// Payload
export interface FileWriteObjectJsonActionPayload<T extends object> {
  drive: string;
  filepath: string;
  data: T;
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions;
}

// Action
export interface FileWriteObjectJsonAction<T extends object> extends Action<FileWriteObjectJsonActionPayload<T>> {
  type: FileActionType.WriteObjectJson;
  payload: FileWriteObjectJsonActionPayload<T>;
}

// Function Types
export type FileWriteObjectJsonActionProcessor<T extends object> = ActionProcessor<FileWriteObjectJsonAction<T>, void>;
export type FileWriteObjectJsonActionRequester<T extends object> = ActionRequester<FileWriteObjectJsonAction<T>, void>;
