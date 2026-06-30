import { createErrorEnumForAction } from '../../types';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteObjectJsonActionRequester } from './FileWriteObjectJsonActionTypes';

export const FileWriteObjectJsonErrorTypeEnum = createErrorEnumForAction(FileActionType.WriteObjectJson, [
  'AccessDenied', // caller lacks permission to write the file
  'DriveNotFound', // storage drive does not exist
]);

export function* askFileWriteObjectJson<T extends object>(
  drive: string,
  filepath: string,
  data: T,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
): FileWriteObjectJsonActionRequester<T> {
  return yield {
    type: FileActionType.WriteObjectJson,
    payload: {
      drive,
      filepath,
      data,

      storageDriveAdvancedWriteOptions,
    },
  };
}
