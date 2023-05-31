import { FileWriteTextContentsActionRequester } from './FileWriteTextContentsActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileWriteTextContents(
  drive: DriveName,
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
