import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import {
  NetworkActionType,
  HTTPNetworkResponse,
  HTTPMethod,
  ResponseTypes,
} from './NetworkActionType';

// Payload
export interface NetworkRequestActionPayload<T> {
  url: string;
  method: HTTPMethod;

  body?: T;
  basePath?: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  responseType: ResponseTypes;
}

// Action
export interface NetworkRequestAction<T> extends Action<NetworkRequestActionPayload<T>> {
  type: NetworkActionType.Request;
  payload: NetworkRequestActionPayload<T>;
}

// Function Types
export type NetworkRequestActionProcessor<T, R> = ActionProcessor<
  NetworkRequestAction<T>,
  HTTPNetworkResponse<R>
>;
export type NetworkRequestActionRequester<T, R> = ActionRequester<
  NetworkRequestAction<T>,
  HTTPNetworkResponse<R>
>;
