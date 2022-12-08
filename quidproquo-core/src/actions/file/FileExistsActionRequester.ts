import { FileExistsActionRequester } from './FileExistsActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileExists(drive: string, filepath: string): FileExistsActionRequester {
  return yield {
    type: FileActionType.Exists,
    payload: {
      drive,
      filepath,
    },
  };
}
