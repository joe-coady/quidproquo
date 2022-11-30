import EventActionTypeEnum from './EventActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface EventTransformEventParamsActionPayload extends ActionPayload {
  type: EventActionTypeEnum.TransformEventParams;
  payload: {
    // Any event from any source
    eventParams: any[];
  };
}

export function* askEventTransformEventParams(
  ...eventParams: any
): Generator<EventTransformEventParamsActionPayload> {
  return yield {
    type: EventActionTypeEnum.TransformEventParams,
    payload: { eventParams },
  };
}

export interface EventTransformResponseResultActionPayload extends ActionPayload {
  type: EventActionTypeEnum.TransformResponseResult;
  payload: {
    response: any;
  };
}

export function* askEventTransformResponseResult(
  response: any,
): Generator<EventTransformResponseResultActionPayload> {
  return yield {
    type: EventActionTypeEnum.TransformResponseResult,
    payload: { response },
  };
}

export interface EventMatchStoryActionPayload extends ActionPayload {
  type: EventActionTypeEnum.MatchStory;
  payload: {
    transformedEventParams: any;
  };
}

export function* askEventMatchStory(
  transformedEventParams: any,
): Generator<EventMatchStoryActionPayload> {
  return yield {
    type: EventActionTypeEnum.MatchStory,
    payload: { transformedEventParams },
  };
}

export interface EventAutoRespondActionPayload extends ActionPayload {
  type: EventActionTypeEnum.AutoRespond;
  payload: {
    transformedEventParams: any;
  };
}

export function* askEventAutoRespond(
  transformedEventParams: any,
): Generator<EventAutoRespondActionPayload> {
  return yield {
    type: EventActionTypeEnum.AutoRespond,
    payload: { transformedEventParams },
  };
}
