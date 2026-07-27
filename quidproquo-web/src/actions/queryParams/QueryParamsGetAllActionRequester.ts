import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsGetAllActionRequester } from './QueryParamsGetAllActionRequesterTypes';

/** Reads the whole query string of the current url as key -> all values for that key. */
export function* askQueryParamsGetAll(): QueryParamsGetAllActionRequester {
  return yield { type: QueryParamsActionType.GetAll };
}
