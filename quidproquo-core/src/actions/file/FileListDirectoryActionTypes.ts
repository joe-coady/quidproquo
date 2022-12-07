import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, FileInfo } from './FileActionType';

// Payload
export interface FileListDirectoryActionPayload {
  drive: string;
  folderPath: string;
}

// Action
export interface FileListDirectoryAction extends Action<FileListDirectoryActionPayload> {
  type: FileActionType.ListDirectory;
  payload: FileListDirectoryActionPayload;
}

// Function Types
export type FileListDirectoryActionProcessor = ActionProcessor<FileListDirectoryAction, FileInfo[]>;
export type FileListDirectoryActionRequester = ActionRequester<FileListDirectoryAction, FileInfo[]>;
