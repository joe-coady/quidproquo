import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadBinaryContentsActionRequester } from './FileReadBinaryContentsActionTypes';

export const FileReadBinaryContentsErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadBinaryContents, [
  'InvalidStorageClass', // object is in cold storage and cannot be read directly
  'FileNotFound', // no object exists at the given filepath
]);

export function* askFileReadBinaryContents(drive: string, filepath: string): FileReadBinaryContentsActionRequester {
  return yield {
    type: FileActionType.ReadBinaryContents,
    payload: {
      drive,
      filepath,
    },
  };
}
