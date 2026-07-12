import { createErrorEnumForAction } from '../../types';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';

export const FileWriteTextContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.WriteTextContents, [
  'AccessDenied', // caller lacks permission to write the file
  'DriveNotFound', // storage drive does not exist
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileWriteTextContents(
  drive: string,
  filepath: string,
  data: string,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
  scope?: string,
): FileWriteTextContentsActionRequester {
  return yield {
    type: FileActionType.WriteTextContents,
    payload: {
      drive,
      filepath,
      data,

      storageDriveAdvancedWriteOptions,
      scope,
    },
  };
}
