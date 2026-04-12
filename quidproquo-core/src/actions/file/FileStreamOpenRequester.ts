import { StreamEncoding } from '../../types/StreamRegistry';
import { FileActionType } from './FileActionType';
import { FileStreamOpenActionRequester } from './FileStreamOpenActionTypes';

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
