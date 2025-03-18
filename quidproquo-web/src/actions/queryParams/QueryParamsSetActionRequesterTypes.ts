import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { QueryParamsActionType } from './QueryParamsActionType';

// Payload
export type QueryParamsSetActionPayload = {
  key: string;
  value: string;
  createHistoryEntry: boolean;
};

// Action
export interface QueryParamsSetAction extends Action<QueryParamsSetActionPayload> {
  type: QueryParamsActionType.Set;
  payload: QueryParamsSetActionPayload;
}

// Function Types
export type QueryParamsSetActionProcessor = ActionProcessor<QueryParamsSetAction, void>;
export type QueryParamsSetActionRequester = ActionRequester<QueryParamsSetAction, void>;
