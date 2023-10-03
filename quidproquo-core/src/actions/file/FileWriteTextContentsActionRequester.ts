import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';

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
      
      storageDriveAdvancedWriteOptions
    },
  };
}
