import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileDeleteActionRequester } from './FileDeleteActionTypes';

export const FileDeleteErrorTypeEnum = createErrorEnumForAction(FileActionType.Delete, [
  'AccessDenied', // caller lacks permission to delete
  'DriveNotFound', // storage drive does not exist
]);

export function* askFileDelete(drive: string, filepaths: string[]): FileDeleteActionRequester {
  return yield {
    type: FileActionType.Delete,
    payload: {
      drive,
      filepaths,
    },
  };
}
