import { FileDeleteActionRequester } from './FileDeleteActionTypes';
import { FileActionType, DriveName } from './FileActionType';

export function* askFileDelete(drive: DriveName, filepaths: string[]): FileDeleteActionRequester {
  return yield {
    type: FileActionType.Delete,
    payload: {
      drive,
      filepaths,
    },
  };
}
