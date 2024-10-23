import { AskResponse } from '../../types/StorySession';
import { FileActionType, FileInfo } from './FileActionType';
import { FileListDirectoryActionRequester } from './FileListDirectoryActionTypes';

export function* askFileListDirectory(
  drive: string,
  folderPath: string,
  maxFiles: number = 1000,
  pageToken?: string,
): FileListDirectoryActionRequester {
  return yield {
    type: FileActionType.ListDirectory,
    payload: {
      drive,
      folderPath,
      pageToken,
      maxFiles,
    },
  };
}

export function* askFileListAllDirectory(drive: string, folderPath: string): AskResponse<FileInfo[]> {
  let pageToken: string | undefined;
  let fileInfos: FileInfo[] = [];

  while (true) {
    const directoryInfo = yield* askFileListDirectory(drive, folderPath, 1000, pageToken);

    fileInfos = [...fileInfos, ...directoryInfo.fileInfos];

    if (!directoryInfo.pageToken) {
      break;
    }

    pageToken = directoryInfo.pageToken;
  }

  return fileInfos;
}
