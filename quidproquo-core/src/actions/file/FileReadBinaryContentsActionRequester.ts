import { FileActionType } from './FileActionType';
import { FileReadBinaryContentsActionRequester } from './FileReadBinaryContentsActionTypes';

export function* askFileReadBinaryContents(drive: string, filepath: string): FileReadBinaryContentsActionRequester {
  return yield {
    type: FileActionType.ReadBinaryContents,
    payload: {
      drive,
      filepath,
    },
  };
}
