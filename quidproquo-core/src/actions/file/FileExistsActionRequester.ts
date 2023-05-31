import { FileExistsActionRequester } from './FileExistsActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileExists(drive: DriveName, filepath: string): FileExistsActionRequester {
  return yield {
    type: FileActionType.Exists,
    payload: {
      drive,
      filepath,
    },
  };
}
