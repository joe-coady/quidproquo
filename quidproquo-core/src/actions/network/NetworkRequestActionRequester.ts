import { createErrorEnumForAction } from '../../types';
import { HTTPMethod, HTTPRequestOptions, NetworkActionType } from './NetworkActionType';
import { NetworkRequestActionRequester } from './NetworkRequestActionTypes';

export const NetworkRequestErrorTypeEnum = createErrorEnumForAction(NetworkActionType.Request, [
  'Timeout', // the request exceeded the request timeout and was aborted
]);

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
