import { createErrorEnumForAction } from '../../types';
import { StreamEncoding } from '../../types/StreamRegistry';
import { FileActionType } from './FileActionType';
import { FileStreamOpenActionRequester } from './FileStreamOpenActionTypes';

export const FileStreamOpenErrorTypeEnum = createErrorEnumForAction(FileActionType.StreamOpen, [
  'InvalidStorageClass', // object is in cold storage and cannot be streamed directly
  'FileNotFound', // no object exists at the given filepath
]);

export function* askFileStreamOpen<E extends StreamEncoding = 'text'>(
  drive: string,
  filepath: string,
  encoding: E = 'text' as E,
  chunkSize?: number,
): FileStreamOpenActionRequester<E> {
  return yield {
    type: FileActionType.StreamOpen,
    payload: {
      drive,
      filepath,
      encoding,
      chunkSize,
    },
  };
}
