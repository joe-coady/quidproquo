import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadTextContentsActionRequester } from './FileReadTextContentsActionTypes';

export const FileReadTextContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadTextContents, ['InvalidStorageClass']);

export function* askFileReadTextContents(drive: string, filepath: string): FileReadTextContentsActionRequester {
  return yield {
    type: FileActionType.ReadTextContents,
    payload: {
      drive,
      filepath,
    },
  };
}
