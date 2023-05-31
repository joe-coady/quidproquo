import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileWriteBinaryContentsActionRequester } from './FileWriteBinaryContentsActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileWriteBinaryContents(
  drive: DriveName,
  filepath: string,
  data: QPQBinaryData,
): FileWriteBinaryContentsActionRequester {
  return yield {
    type: FileActionType.WriteBinaryContents,
    payload: {
      drive,
      filepath,
      data,
    },
  };
}
