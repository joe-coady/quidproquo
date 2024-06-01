import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// Payload
export interface EventGetRecordsActionPayload<EventParams extends Array<unknown>> {
  eventParams: EventParams;
}

// Action
export interface EventGetRecordsAction<EventParams extends Array<unknown>> extends Action<EventGetRecordsActionPayload<EventParams>> {
  type: EventActionType.GetRecords;
  payload: EventGetRecordsActionPayload<EventParams>;
}

// Functions
export type EventGetRecordsActionProcessor<EventParams extends Array<unknown>, QpqEventRecord> = ActionProcessor<
  EventGetRecordsAction<EventParams>,
  QpqEventRecord[]
>;
export type EventGetRecordsActionRequester<EventParams extends Array<unknown>, QpqEventRecord> = ActionRequester<
  EventGetRecordsAction<EventParams>,
  QpqEventRecord[]
>;
