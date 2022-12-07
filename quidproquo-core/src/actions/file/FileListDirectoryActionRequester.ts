import { FileListDirectoryActionRequester } from './FileListDirectoryActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileListDirectory(
  drive: string,
  folderPath: string,
): FileListDirectoryActionRequester {
  return yield {
    type: FileActionType.ListDirectory,
    payload: {
      drive,
      folderPath,
    },
  };
}
