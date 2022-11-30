import EventActionTypeEnum from "./EventActionTypeEnum";

export function* askEventTransformEventParams(
  ...params: any
): Generator<any, any, any> {
  return yield {
    type: EventActionTypeEnum.TransformEventParams,
    payload: { params },
  };
}

export function* askEventTransformResponseResult(
  response: any
): Generator<any, any, any> {
  return yield {
    type: EventActionTypeEnum.TransformResponseResult,
    payload: { response },
  };
}

export function* askEventMatchStory(
  transformedEventParams: any
): Generator<any, any, any> {
  return yield {
    type: EventActionTypeEnum.MatchStory,
    payload: { transformedEventParams },
  };
}

export function* askEventAutoRespond(
  transformedEventParams: any
): Generator<any, any, any> {
  return yield {
    type: EventActionTypeEnum.AutoRespond,
    payload: { transformedEventParams },
  };
}
