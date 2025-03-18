import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsSetActionRequester } from './QueryParamsSetActionRequesterTypes';

export function* askQueryParamsSet(key: string, value: string, createHistoryEntry: boolean = false): QueryParamsSetActionRequester {
  return yield { type: QueryParamsActionType.Set, payload: { key, value, createHistoryEntry } };
}
