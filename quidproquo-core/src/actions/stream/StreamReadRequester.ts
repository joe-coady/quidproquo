import { StreamChunk, StreamDataType, StreamEncoding, StreamHandle } from '../../types/StreamRegistry';
import { StreamActionType } from './StreamActionType';
import { StreamReadActionRequester } from './StreamReadActionTypes';

const decodeBase64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export function* askStreamRead<E extends StreamEncoding>(
  handle: StreamHandle<E>,
  noWait?: boolean,
): StreamReadActionRequester<E> {
  const rawChunk: StreamChunk<string> = yield {
    type: StreamActionType.Read,
    payload: {
      streamId: handle.id,
      noWait,
    },
  };

  if (!rawChunk.data || rawChunk.done || rawChunk.skipped) {
    return rawChunk as StreamChunk<StreamDataType<E>>;
  }

  if (handle.encoding === 'binary') {
    return { ...rawChunk, data: decodeBase64ToUint8Array(rawChunk.data) } as StreamChunk<StreamDataType<E>>;
  }

  return rawChunk as StreamChunk<StreamDataType<E>>;
}
