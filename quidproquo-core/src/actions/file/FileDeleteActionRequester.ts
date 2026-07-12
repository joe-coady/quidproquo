import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileDeleteActionRequester } from './FileDeleteActionTypes';

export const FileDeleteErrorTypeEnum = createErrorEnumForAction(FileActionType.Delete, [
  'AccessDenied', // caller lacks permission to delete
  'DriveNotFound', // storage drive does not exist
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileDelete(drive: string, filepaths: string[], scope?: string): FileDeleteActionRequester {
  return yield {
    type: FileActionType.Delete,
    payload: {
      drive,
      filepaths,
      scope,
    },
  };
}
