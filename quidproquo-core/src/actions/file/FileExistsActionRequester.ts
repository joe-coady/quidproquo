import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileExistsActionRequester } from './FileExistsActionTypes';

export const FileExistsErrorTypeEnum = createErrorEnumForAction(FileActionType.Exists, [
  'AccessDenied', // caller lacks permission to check existence
]);

export function* askFileExists(drive: string, filepath: string): FileExistsActionRequester {
  return yield {
    type: FileActionType.Exists,
    payload: {
      drive,
      filepath,
    },
  };
}
