import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';

export const FileReadTextContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadTextContents, [
  'InvalidStorageClass', // object is in cold storage and cannot be read directly
  'FileNotFound', // no object exists at the given filepath
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileReadTextContents(drive: string, filepath: string, scope?: string): FileReadTextContentsActionRequester {
  return yield {
    type: FileActionType.ReadTextContents,
    payload: {
      drive,
      filepath,
      scope,
    },
  };
}
