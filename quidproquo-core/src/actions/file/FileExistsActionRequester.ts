import { FileActionType } from './FileActionType';
import { FileExistsActionRequester } from './FileExistsActionTypes';

export function* askFileExists(drive: string, filepath: string): FileExistsActionRequester {
  return yield {
    type: FileActionType.Exists,
    payload: {
      drive,
      filepath,
    },
  };
}
