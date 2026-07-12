import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileExistsActionRequester } from './FileExistsActionTypes';

export const FileExistsErrorTypeEnum = createErrorEnumForAction(FileActionType.Exists, [
  'AccessDenied', // caller lacks permission to check existence
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileExists(drive: string, filepath: string, scope?: string): FileExistsActionRequester {
  return yield {
    type: FileActionType.Exists,
    payload: {
      drive,
      filepath,
      scope,
    },
  };
}
