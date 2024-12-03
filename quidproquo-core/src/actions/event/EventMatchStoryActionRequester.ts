import { AnyMatchStoryResult, EventActionType } from './EventActionType';
import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';

export function* askEventMatchStory<QpqEventRecord, MSR extends AnyMatchStoryResult, EventParams extends Array<unknown>>(
  qpqEventRecord: QpqEventRecord,
  eventParams: EventParams,
): EventMatchStoryActionRequester<QpqEventRecord, MSR, EventParams> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { qpqEventRecord, eventParams },
  };
}
