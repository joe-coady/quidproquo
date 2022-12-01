import EventActionTypeEnum from './EventActionTypeEnum';
import { Action } from '../../types/Action';

export interface EventTransformEventParamsActionPayload<T extends Array<unknown>> {
  eventParams: T;
}
export interface EventTransformEventParamsAction<T extends Array<unknown>> extends Action {
  type: EventActionTypeEnum.TransformEventParams;
  payload: EventTransformEventParamsActionPayload<T>;
}

export interface EventTransformResponseResultActionPayload {
  response: any;
}

export interface EventTransformResponseResultAction extends Action {
  type: EventActionTypeEnum.TransformResponseResult;
  payload: EventTransformResponseResultActionPayload;
}

export type MatchStoryResult = {
  src?: string;
  runtime?: string;
  errorResourceNotFound?: string;
};

export interface EventMatchStoryActionPayload<T> {
  transformedEventParams: T;
}

export interface EventMatchStoryAction<T> extends Action {
  type: EventActionTypeEnum.MatchStory;
  payload: EventMatchStoryActionPayload<T>;
}

export interface EventAutoRespondActionPayload<T> {
  transformedEventParams: T;
}

export interface EventAutoRespondAction<T> extends Action {
  type: EventActionTypeEnum.AutoRespond;
  payload: EventAutoRespondActionPayload<T>;
}
