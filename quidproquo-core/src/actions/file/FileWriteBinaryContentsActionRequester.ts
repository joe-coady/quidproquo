import { createErrorEnumForAction } from '../../types';
import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteBinaryContentsActionRequester } from './FileWriteBinaryContentsActionTypes';

export const FileWriteBinaryContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.WriteBinaryContents, [
  'AccessDenied', // caller lacks permission to write the file
  'DriveNotFound', // storage drive does not exist
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileWriteBinaryContents(
  drive: string,
  filepath: string,
  data: QPQBinaryData,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
  scope?: string,
): FileWriteBinaryContentsActionRequester {
  return yield {
    type: FileActionType.WriteBinaryContents,
    payload: {
      drive,
      filepath,
      data,

      storageDriveAdvancedWriteOptions,
      scope,
    },
  };
}
