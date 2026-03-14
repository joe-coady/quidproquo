import { AskResponse } from 'quidproquo-core';

import { askServiceRequest } from './ServiceRequestActionRequester';

export interface ServiceRequester<TPayload> {
  (payload: TPayload): AskResponse<void>;
  serviceRequest: { serviceName: string; method: string };
}

export const createServiceRequester = <TPayload>(
  serviceName: string,
  method: string
) => {
  const requester = function* askWrapServiceRequest(
    payload: TPayload
  ): AskResponse<void> {
    yield* askServiceRequest(serviceName, method, payload);
  };

  requester.serviceRequest = { serviceName, method };

  return requester as ServiceRequester<TPayload>;
};
