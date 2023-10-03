import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileWriteBinaryContentsActionRequester } from './FileWriteBinaryContentsActionTypes';
import { FileActionType, StorageDriveAdvancedWriteOptions } from './FileActionType';

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
      
      storageDriveAdvancedWriteOptions
    },
  };
}
