import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsGetActionRequester } from './QueryParamsGetActionRequesterTypes';

/** Reads ALL values of a query-string key from the current url (repeated keys are legal, hence string[]). Empty array when absent. */
export function* askQueryParamsGet(key: string): QueryParamsGetActionRequester {
  return yield { type: QueryParamsActionType.Get, payload: { key } };
}
