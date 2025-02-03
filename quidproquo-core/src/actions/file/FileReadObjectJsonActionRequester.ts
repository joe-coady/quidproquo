import { createErrorEnumForAction } from '../../types';
import { FileActionType } from './FileActionType';
import { FileReadObjectJsonActionRequester } from './FileReadObjectJsonActionTypes';

export const FileReadObjectJsonErrorTypeEnum = createErrorEnumForAction(FileActionType.ReadObjectJson, ['InvalidStorageClass']);

export function* askFileReadObjectJson<T extends object>(drive: string, filepath: string): FileReadObjectJsonActionRequester<T> {
  return yield {
    type: FileActionType.ReadObjectJson,
    payload: {
      drive,
      filepath,
    },
  };
}
