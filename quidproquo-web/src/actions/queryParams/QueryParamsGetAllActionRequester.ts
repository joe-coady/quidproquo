import { QueryParamsActionType } from './QueryParamsActionType';
import { QueryParamsGetAllActionRequester } from './QueryParamsGetAllActionRequesterTypes';

export function* askQueryParamsGetAll(): QueryParamsGetAllActionRequester {
  return yield { type: QueryParamsActionType.GetAll };
}
