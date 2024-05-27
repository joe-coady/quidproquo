import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';
import { EventActionType, AnyMatchStoryResult } from './EventActionType';

export function* askEventMatchStory<QpqEventRecord, MSR extends AnyMatchStoryResult>(
  qpqEventRecord: QpqEventRecord,
): EventMatchStoryActionRequester<QpqEventRecord, MSR> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { qpqEventRecord },
  };
}
