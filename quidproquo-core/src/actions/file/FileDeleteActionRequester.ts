import { FileActionType } from './FileActionType';
import { FileDeleteActionRequester } from './FileDeleteActionTypes';

export function* askFileDelete(drive: string, filepaths: string[]): FileDeleteActionRequester {
  return yield {
    type: FileActionType.Delete,
    payload: {
      drive,
      filepaths,
    },
  };
}
