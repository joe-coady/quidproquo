import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';
import { FileWriteBinaryContentsActionRequester } from './FileWriteBinaryContentsActionTypes';

export function* askFileWriteBinaryContents(
  drive: string,
  filepath: string,
  data: QPQBinaryData,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
): FileWriteBinaryContentsActionRequester {
  return yield {
    type: FileActionType.WriteBinaryContents,
    payload: {
      drive,
      filepath,
      data,

      storageDriveAdvancedWriteOptions,
    },
  };
}
