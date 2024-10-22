import { FileReadBinaryContentsActionRequester } from './FileReadBinaryContentsActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileReadBinaryContents(drive: string, filepath: string): FileReadBinaryContentsActionRequester {
  return yield {
    type: FileActionType.ReadBinaryContents,
    payload: {
      drive,
      filepath,
    },
  };
}
