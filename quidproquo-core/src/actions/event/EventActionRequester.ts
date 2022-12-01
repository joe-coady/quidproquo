import EventActionTypeEnum from './EventActionTypeEnum';
import {
  EventTransformEventParamsAction,
  EventTransformResponseResultAction,
  EventMatchStoryAction,
  EventAutoRespondAction,
  MatchStoryResult,
} from './EventActionTypes';

export function* askEventTransformEventParams<T extends Array<unknown>>(
  ...eventParams: T
): Generator<EventTransformEventParamsAction<T>> {
  return yield {
    type: EventActionTypeEnum.TransformEventParams,
    payload: { eventParams },
  };
}

export function* askEventTransformResponseResult(
  response: any,
): Generator<EventTransformResponseResultAction> {
  return yield {
    type: EventActionTypeEnum.TransformResponseResult,
    payload: { response },
  };
}

export function* askEventMatchStory<T>(
  transformedEventParams: any,
): Generator<EventMatchStoryAction<T>, MatchStoryResult, MatchStoryResult> {
  return yield {
    type: EventActionTypeEnum.MatchStory,
    payload: { transformedEventParams },
  };
}

export function* askEventAutoRespond<T>(
  transformedEventParams: any,
): Generator<EventAutoRespondAction<T>> {
  return yield {
    type: EventActionTypeEnum.AutoRespond,
    payload: { transformedEventParams },
  };
}
