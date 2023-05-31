import { FileReadBinaryContentsActionRequester } from './FileReadBinaryContentsActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileReadBinaryContents(
  drive: DriveName,
  filepath: string,
): FileReadBinaryContentsActionRequester {
  return yield {
    type: FileActionType.ReadBinaryContents,
    payload: {
      drive,
      filepath,
    },
  };
}
