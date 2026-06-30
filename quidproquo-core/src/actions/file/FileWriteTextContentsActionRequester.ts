import { createErrorEnumForAction } from '../../types';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';

export const FileWriteTextContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.WriteTextContents, [
  'AccessDenied', // caller lacks permission to write the file
  'DriveNotFound', // storage drive does not exist
]);

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
