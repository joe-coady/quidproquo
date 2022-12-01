import EventActionTypeEnum from './EventActionTypeEnum';
import { Action } from '../../types/Action';

export interface EventTransformEventParamsActionPayload<T extends Array<unknown>> {
  eventParams: T;
}
export interface EventTransformEventParamsAction<T extends Array<unknown>>
  extends Action<EventTransformEventParamsActionPayload<T>> {
  type: EventActionTypeEnum.TransformEventParams;
}

export interface EventTransformResponseResultActionPayload {
  response: any;
}

export interface EventTransformResponseResultAction
  extends Action<EventTransformResponseResultActionPayload> {
  type: EventActionTypeEnum.TransformResponseResult;
}

export type MatchStoryResult = {
  src?: string;
  runtime?: string;
  errorResourceNotFound?: string;
};

export interface EventMatchStoryActionPayload<T> {
  transformedEventParams: T;
}

export interface EventMatchStoryAction<T> extends Action<EventMatchStoryActionPayload<T>> {
  type: EventActionTypeEnum.MatchStory;
}

export interface EventAutoRespondActionPayload<T> {
  transformedEventParams: T;
}

export interface EventAutoRespondAction<T> extends Action<EventAutoRespondActionPayload<T>> {
  type: EventActionTypeEnum.AutoRespond;
}
