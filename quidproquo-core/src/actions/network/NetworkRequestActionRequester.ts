import { HTTPMethod, HTTPRequestOptions,NetworkActionType } from './NetworkActionType';
import { NetworkRequestActionRequester } from './NetworkRequestActionTypes';

export function* askNetworkRequest<T, R>(
  method: HTTPMethod,
  url: string,

  httpRequestOptions?: HTTPRequestOptions<T>,
): NetworkRequestActionRequester<T, R> {
  return yield {
    type: NetworkActionType.Request,
    payload: {
      url,
      method,

      body: httpRequestOptions?.body,
      headers: httpRequestOptions?.headers,
      basePath: httpRequestOptions?.basePath,
      params: httpRequestOptions?.params,
      responseType: httpRequestOptions?.responseType || 'json',
    },
  };
}
