import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteObjectJsonActionRequester } from './FileWriteObjectJsonActionTypes';

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
