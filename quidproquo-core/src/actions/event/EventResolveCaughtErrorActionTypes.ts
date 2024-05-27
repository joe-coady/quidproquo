import { QPQError } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { EventActionType } from './EventActionType';

// payload
export interface EventResolveCaughtErrorActionPayload {
  error: QPQError;
}

// action
export interface EventResolveCaughtErrorAction extends Action<EventResolveCaughtErrorActionPayload> {
  type: EventActionType.ResolveCaughtError;
  payload: EventResolveCaughtErrorActionPayload;
}

// Functions
export type EventResolveCaughtErrorActionProcessor<TransformedEventParams> = ActionProcessor<EventResolveCaughtErrorAction, TransformedEventParams>;
export type EventResolveCaughtErrorActionRequester<TransformedEventParams> = ActionRequester<EventResolveCaughtErrorAction, TransformedEventParams>;
