import EventActionTypeEnum from './EventActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface EventTransformEventParamsActionPayload<T extends Array<unknown>> {
  eventParams: T;
}
export interface EventTransformEventParamsAction<T extends Array<unknown>> extends ActionPayload {
  type: EventActionTypeEnum.TransformEventParams;
  payload: EventTransformEventParamsActionPayload<T>;
}

export interface EventTransformResponseResultActionPayload {
  response: any;
}

export interface EventTransformResponseResultAction extends ActionPayload {
  type: EventActionTypeEnum.TransformResponseResult;
  payload: EventTransformResponseResultActionPayload;
}

export interface EventMatchStoryActionPayload<T> {
  transformedEventParams: T;
}

export interface EventMatchStoryAction<T> extends ActionPayload {
  type: EventActionTypeEnum.MatchStory;
  payload: EventMatchStoryActionPayload<T>;
}

export interface EventAutoRespondActionPayload<T> {
  transformedEventParams: T;
}

export interface EventAutoRespondAction<T> extends ActionPayload {
  type: EventActionTypeEnum.AutoRespond;
  payload: EventAutoRespondActionPayload<T>;
}
