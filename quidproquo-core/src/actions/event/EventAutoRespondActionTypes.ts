import { Action } from '../../types/Action';
import { AnyMatchStoryResult, EventActionType } from './EventActionType';

// payload
export interface EventAutoRespondActionPayload<QpqEventRecord, MSR extends AnyMatchStoryResult> {
  qpqEventRecord: QpqEventRecord;
  matchResult: MSR;
}

// action
export interface EventAutoRespondAction<QpqEventRecord, MSR extends AnyMatchStoryResult> extends Action<
  EventAutoRespondActionPayload<QpqEventRecord, MSR>
> {
  type: EventActionType.AutoRespond;
  payload: EventAutoRespondActionPayload<QpqEventRecord, MSR>;
}

// Functions
