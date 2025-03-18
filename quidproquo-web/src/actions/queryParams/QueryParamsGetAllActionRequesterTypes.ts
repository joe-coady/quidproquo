import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { QueryParamsActionType } from './QueryParamsActionType';

// Payload
export type QueryParamsGetAllActionPayload = undefined;

// Action
export interface QueryParamsGetAllAction extends Action<QueryParamsGetAllActionPayload> {
  type: QueryParamsActionType.GetAll;
}

// Function Types
export type QueryParamsGetAllActionProcessor = ActionProcessor<QueryParamsGetAllAction, Record<string, string[]>>;
export type QueryParamsGetAllActionRequester = ActionRequester<QueryParamsGetAllAction, Record<string, string[]>>;
