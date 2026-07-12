import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadObjectJsonActionRequester } from './FileReadObjectJsonActionTypes';

export const FileReadObjectJsonErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadObjectJson, [
  'InvalidStorageClass', // object is in cold storage and cannot be read directly
  'FileNotFound', // no object exists at the given filepath
  'InvalidJson', // file contents are not parseable JSON
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
