import { FileActionType } from './FileActionType';
import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';

export function* askFileReadTextContents(drive: string, filepath: string): FileReadTextContentsActionRequester {
  return yield {
    type: FileActionType.ReadTextContents,
    payload: {
      drive,
      filepath,
    },
  };
}
