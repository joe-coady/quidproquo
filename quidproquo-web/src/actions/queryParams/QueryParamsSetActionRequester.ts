import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsSetActionRequester } from './QueryParamsSetActionRequesterTypes';

/**
 * Replaces a query-string key's values in the current url; an empty array removes
 * the key. By default the url is swapped in place (replaceState); pass
 * createHistoryEntry to make the change a back-button stop (pushState).
 */
export function* askQueryParamsSet(key: string, values: string[], createHistoryEntry: boolean = false): QueryParamsSetActionRequester {
  return yield { type: QueryParamsActionType.Set, payload: { key, values, createHistoryEntry } };
}
