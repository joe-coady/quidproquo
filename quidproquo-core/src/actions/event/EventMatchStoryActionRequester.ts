import { AnyMatchStoryResult,EventActionType } from './EventActionType';
import { EventMatchStoryActionRequester } from './EventMatchStoryActionTypes';

export function* askEventMatchStory<QpqEventRecord, MSR extends AnyMatchStoryResult>(
  qpqEventRecord: QpqEventRecord,
): EventMatchStoryActionRequester<QpqEventRecord, MSR> {
  return yield {
    type: EventActionType.MatchStory,
    payload: { qpqEventRecord },
  };
}
