import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadObjectJsonActionRequester } from './FileReadObjectJsonActionTypes';

export const FileReadObjectJsonErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadObjectJson, [
  'InvalidStorageClass',
  'InvalidScope', // scope is not a valid single path segment
]);

export function* askFileReadObjectJson<T extends object>(drive: string, filepath: string, scope?: string): FileReadObjectJsonActionRequester<T> {
  return yield {
    type: FileActionType.ReadObjectJson,
    payload: {
      drive,
      filepath,
      scope,
    },
  };
}
