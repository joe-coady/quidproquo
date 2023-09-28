import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';
import { FileActionType, DriveName, StorageDriveAdvancedWriteOptions } from './FileActionType';

export function* askFileWriteTextContents(
  drive: DriveName,
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
