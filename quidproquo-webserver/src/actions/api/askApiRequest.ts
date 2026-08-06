import { AskResponse, createActionRequester, HTTPMethod, HTTPNetworkResponse } from 'quidproquo-core';

import { ApiActionType } from './ApiActionType';
import { ApiRequestOptions } from './ApiRequestActionRequesterTypes';

export const askApiRequestBase = createActionRequester<HTTPNetworkResponse<unknown>>()({
  actionType: ApiActionType.Request,
  getPayload: (service: string, method: HTTPMethod, endpoint: string, options?: ApiRequestOptions<unknown>) => ({
    service,
    endpoint,
    method,
    body: options?.body,
    headers: options?.headers,
    params: options?.params,
    responseType: options?.responseType || 'json',
  }),
});

// The request and response body types are only known to the caller, so the base takes
// and returns unknown and this story casts to what the caller declared.
export function* askApiRequest<T, R>(
  service: string,
  method: HTTPMethod,
  endpoint: string,
  options?: ApiRequestOptions<T>,
): AskResponse<HTTPNetworkResponse<R>> {
  return (yield* askApiRequestBase(service, method, endpoint, options as ApiRequestOptions<unknown>)) as HTTPNetworkResponse<R>;
}
