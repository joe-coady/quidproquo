import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileReadTextContents(
  drive: DriveName,
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
