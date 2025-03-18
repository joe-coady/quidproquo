import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsGetActionRequester } from './QueryParamsGetActionRequesterTypes';

export function* askQueryParamsGet(key: string): QueryParamsGetActionRequester {
  return yield { type: QueryParamsActionType.Get, payload: { key } };
}
