import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileWriteTextContents(
  drive: string,
  filepath: string,
  data: string,
): FileWriteTextContentsActionRequester {
  return yield {
    type: FileActionType.WriteTextContents,
    payload: {
      drive,
      filepath,
      data,
    },
  };
}
