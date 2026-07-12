import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';

export const FileReadTextContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadTextContents, [
  'InvalidStorageClass',
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
