import { HTTPMethod } from 'quidproquo-core';

import { ApiActionType } from './ApiActionType';
import { ApiRequestActionRequester, ApiRequestOptions } from './ApiRequestActionRequesterTypes';

export function* askApiRequest<T, R>(
  service: string,
  method: HTTPMethod,
  endpoint: string,
  options?: ApiRequestOptions<T>,
): ApiRequestActionRequester<T, R> {
  return yield {
    type: ApiActionType.Request,
    payload: {
      service,
      endpoint,
      method,
      body: options?.body,
      headers: options?.headers,
      params: options?.params,
      responseType: options?.responseType || 'json',
    },
  };
}
