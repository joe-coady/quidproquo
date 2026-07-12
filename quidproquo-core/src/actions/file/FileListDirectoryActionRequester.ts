import { createErrorEnumForAction } from '../../types';
import { AskResponse } from '../../types/StorySession';
import { FileActionType, FileInfo } from './FileActionType';
import { FileListDirectoryActionRequester } from './FileListDirectoryActionTypes';

export const FileListDirectoryErrorTypeEnum = createErrorEnumForAction(FileActionType.ListDirectory, [
  'AccessDenied', // caller lacks permission to list the directory
  'DirectoryNotFound', // no directory exists at the given folderPath
  'NotADirectory', // the folderPath points at a file, not a directory
  'DriveNotFound', // storage drive does not exist
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileListDirectory(
  drive: string,
  folderPath: string,
  maxFiles: number = 1000,
  pageToken?: string,
  scope?: string,
): FileListDirectoryActionRequester {
  return yield {
    type: FileActionType.ListDirectory,
    payload: {
      drive,
      folderPath,
      pageToken,
      maxFiles,
      scope,
    },
  };
}

export function* askFileListAllDirectory(drive: string, folderPath: string, scope?: string): AskResponse<FileInfo[]> {
  let pageToken: string | undefined;
  let fileInfos: FileInfo[] = [];

  while (true) {
    const directoryInfo = yield* askFileListDirectory(drive, folderPath, 1000, pageToken, scope);

    fileInfos = [...fileInfos, ...directoryInfo.fileInfos];

    if (!directoryInfo.pageToken) {
      break;
    }

    pageToken = directoryInfo.pageToken;
  }

  return fileInfos;
}
