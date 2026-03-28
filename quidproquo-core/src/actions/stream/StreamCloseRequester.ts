import { StreamHandle } from '../../types/StreamRegistry';
import { StreamActionType } from './StreamActionType';
import { StreamCloseActionRequester } from './StreamCloseActionTypes';

export function* askStreamClose(handle: StreamHandle): StreamCloseActionRequester {
  return yield {
    type: StreamActionType.Close,
    payload: {
      streamId: handle.id,
    },
  };
}
