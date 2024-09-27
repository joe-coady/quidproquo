import { HTTPNetworkResponse, NetworkRequestActionPayload } from 'quidproquo-core';
import { preformNetworkRequest } from 'quidproquo-web';
import { useFastCallback } from '../../hooks';
import { useAuthAccessToken } from '../../auth';

export const useAuthenticatedNetworkRequest = <R>(payload: NetworkRequestActionPayload<any>): (() => Promise<HTTPNetworkResponse<R>>) => {
  const authToken = useAuthAccessToken();

  const payloadWithAuthHeaders: NetworkRequestActionPayload<any> = authToken
    ? {
        ...payload,
        headers: {
          ...(payload.headers || {}),
          Authorization: `Bearer ${authToken}`,
        },
      }
    : payload;

  const requeser = useFastCallback(() => preformNetworkRequest<R>(payloadWithAuthHeaders));

  return requeser;
};
