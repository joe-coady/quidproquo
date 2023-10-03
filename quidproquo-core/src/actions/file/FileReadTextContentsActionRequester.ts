import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileReadTextContents(
  drive: string,
  filepath: string,
): FileReadTextContentsActionRequester {
  return yield {
    type: FileActionType.ReadTextContents,
    payload: {
      drive,
      filepath,
    },
  };
}
