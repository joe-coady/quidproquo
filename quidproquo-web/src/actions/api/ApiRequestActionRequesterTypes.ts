import { Action, ActionProcessor, ActionRequester, HTTPMethod, HTTPNetworkResponse, HTTPRequestOptions, ResponseType } from 'quidproquo-core';

import { ApiActionType } from './ApiActionType';

// basePath is resolved by the processor, so it is omitted from the caller options
export type ApiRequestOptions<T> = Omit<HTTPRequestOptions<T>, 'basePath'>;

// Payload
export interface ApiRequestActionPayload<T> {
  service: string;
  endpoint: string;
  method: HTTPMethod;
  body?: T;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  responseType: ResponseType;
}

// Action
export interface ApiRequestAction<T> extends Action<ApiRequestActionPayload<T>> {
  type: ApiActionType.Request;
  payload: ApiRequestActionPayload<T>;
}

// Function Types
export type ApiRequestActionProcessor<T, R> = ActionProcessor<ApiRequestAction<T>, HTTPNetworkResponse<R>>;
export type ApiRequestActionRequester<T, R> = ActionRequester<ApiRequestAction<T>, HTTPNetworkResponse<R>>;
