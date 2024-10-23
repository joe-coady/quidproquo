import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';

export function* askFileWriteTextContents(
  drive: string,
  filepath: string,
  data: string,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
): FileWriteTextContentsActionRequester {
  return yield {
    type: FileActionType.WriteTextContents,
    payload: {
      drive,
      filepath,
      data,

      storageDriveAdvancedWriteOptions,
    },
  };
}
