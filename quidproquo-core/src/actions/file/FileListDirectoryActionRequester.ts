import { FileListDirectoryActionRequester } from './FileListDirectoryActionTypes';
import { FileActionType, FileInfo } from './FileActionType';
import { AskResponse } from '../../types/StorySession';

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

export function* askFileListAllDirectory(
  drive: string,
  folderPath: string,
): AskResponse<FileInfo[]> {
  var pageToken: string | undefined;
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
