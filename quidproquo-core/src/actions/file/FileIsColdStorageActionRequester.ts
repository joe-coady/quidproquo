import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileIsColdStorageActionRequester } from './FileIsColdStorageActionTypes';

export const FileIsColdStorageErrorTypeEnum = createErrorEnumForAction(FileActionType.IsColdStorage, [
  'AccessDenied', // caller lacks permission to read the object metadata
  'FileNotFound', // no object exists at the given filepath
  'DriveNotFound', // storage drive does not exist
]);

export function* askFileIsColdStorage(drive: string, filepath: string): FileIsColdStorageActionRequester {
  return yield {
    type: FileActionType.IsColdStorage,
    payload: {
      drive,
      filepath,
    },
  };
}
