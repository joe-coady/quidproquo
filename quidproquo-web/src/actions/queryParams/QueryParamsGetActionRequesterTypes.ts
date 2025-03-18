import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { QueryParamsActionType } from './QueryParamsActionType';

// Payload
export type QueryParamsGetActionPayload = {
  key: string;
};

// Action
export interface QueryParamsGetAction extends Action<QueryParamsGetActionPayload> {
  type: QueryParamsActionType.Get;
  payload: QueryParamsGetActionPayload;
}

// Function Types
export type QueryParamsGetActionProcessor = ActionProcessor<QueryParamsGetAction, string | undefined>;
export type QueryParamsGetActionRequester = ActionRequester<QueryParamsGetAction, string | undefined>;
