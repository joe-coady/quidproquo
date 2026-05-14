import { askStreamClose } from '../../actions/stream/StreamCloseRequester';
import { askStreamRead } from '../../actions/stream/StreamReadRequester';
import { AskResponse } from '../../types';
import { StreamDataType, StreamEncoding, StreamHandle } from '../../types/StreamRegistry';

export function* askStreamMap<E extends StreamEncoding, T, R = StreamDataType<E, T>>(
  handle: StreamHandle<E, T>,
  askCallback: (item: StreamDataType<E, T>, index: number) => AskResponse<R> = function* (item): AskResponse<R> {
    return item as unknown as R;
  },
): AskResponse<R[]> {
  const results: R[] = [];
  let index = 0;

  while (true) {
    const { done, skipped, data } = yield* askStreamRead(handle);

    if (done) {
      break;
    }

    if (skipped || data === undefined) {
      continue;
    }

    results.push(yield* askCallback(data, index));
    index += 1;
  }

  yield* askStreamClose(handle);

  return results;
}
