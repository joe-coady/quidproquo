import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsSetActionRequester } from './QueryParamsSetActionRequesterTypes';

export function* askQueryParamsSet(key: string, values: string[], createHistoryEntry: boolean = false): QueryParamsSetActionRequester {
  return yield { type: QueryParamsActionType.Set, payload: { key, values, createHistoryEntry } };
}
