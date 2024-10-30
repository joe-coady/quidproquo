import { FileActionType } from './FileActionType';
import { FileIsColdStorageActionRequester } from './FileIsColdStorageActionTypes';

export function* askFileIsColdStorage(drive: string, filepath: string): FileIsColdStorageActionRequester {
  return yield {
    type: FileActionType.IsColdStorage,
    payload: {
      drive,
      filepath,
    },
  };
}
