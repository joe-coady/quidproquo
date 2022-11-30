import RouteActionTypeEnum from "./RouteActionTypeEnum";

export function* askRouteTransformEventParams(...params: any): Generator<any, any, any> {
  return yield { type: RouteActionTypeEnum.TransformEventParams, payload: { params } };
}

export function* askRouteTransformResponseResult(response: any): Generator<any, any, any> {
  return yield { type: RouteActionTypeEnum.TransformResponseResult, payload: { response } };
}

export function* askRouteMatch(method: string, path: string): Generator<any, any, any> {
  return yield { type: RouteActionTypeEnum.Match, payload: { method, path } };
}

export function* askRouteAutoRespond(http: any): Generator<any, any, any> {
  return yield { type: RouteActionTypeEnum.AutoRespond, payload: { http } };
}