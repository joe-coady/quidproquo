import { FileDeleteActionRequester } from './FileDeleteActionTypes';
import { FileActionType } from './FileActionType';

export function* askFileDelete(drive: string, filepaths: string[]): FileDeleteActionRequester {
  return yield {
    type: FileActionType.Delete,
    payload: {
      drive,
      filepaths,
    },
  };
}
