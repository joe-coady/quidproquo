import { askStreamClose } from '../../actions/stream/StreamCloseRequester';
import { askStreamRead } from '../../actions/stream/StreamReadRequester';
import { AskResponse } from '../../types';
import { StreamDataType, StreamEncoding, StreamHandle } from '../../types/StreamRegistry';

export function* askStreamProcess<E extends StreamEncoding, T>(
  handle: StreamHandle<E, T>,
  askCallback: (item: StreamDataType<E, T>, index: number) => AskResponse<void>,
): AskResponse<void> {
  let index = 0;

  while (true) {
    const { done, skipped, data } = yield* askStreamRead(handle);

    if (done) {
      break;
    }

    if (skipped || data === undefined) {
      continue;
    }

    yield* askCallback(data, index);
    index += 1;
  }

  yield* askStreamClose(handle);
}
