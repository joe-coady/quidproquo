import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileWriteBinaryContentsActionRequester } from './FileWriteBinaryContentsActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileWriteBinaryContents(
  drive: string,
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
