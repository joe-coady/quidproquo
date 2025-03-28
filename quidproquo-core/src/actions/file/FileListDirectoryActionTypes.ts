import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { DirectoryList, FileActionType } from './FileActionType';

// Payload
export interface FileListDirectoryActionPayload {
  drive: string;
  folderPath: string;
  maxFiles: number;
  pageToken?: string;
}

// Action
export interface FileListDirectoryAction extends Action<FileListDirectoryActionPayload> {
  type: FileActionType.ListDirectory;
  payload: FileListDirectoryActionPayload;
}

// Function Types
export type FileListDirectoryActionProcessor = ActionProcessor<FileListDirectoryAction, DirectoryList>;
export type FileListDirectoryActionRequester = ActionRequester<FileListDirectoryAction, DirectoryList>;
