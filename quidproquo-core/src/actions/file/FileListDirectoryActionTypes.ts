import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, DirectoryList, DriveName } from './FileActionType';

// Payload
export interface FileListDirectoryActionPayload {
  drive: DriveName;
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
export type FileListDirectoryActionProcessor = ActionProcessor<
  FileListDirectoryAction,
  DirectoryList
>;
export type FileListDirectoryActionRequester = ActionRequester<
  FileListDirectoryAction,
  DirectoryList
>;
