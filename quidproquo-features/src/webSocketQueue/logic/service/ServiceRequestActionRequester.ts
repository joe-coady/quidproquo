import { ServiceActionType } from './ServiceActionType';
import { ServiceRequestActionRequester } from './ServiceRequestActionTypes';

export function* askServiceRequest<TPayload, TResponse>(
  serviceName: string,
  method: string,
  payload: TPayload,
): ServiceRequestActionRequester<TPayload, TResponse> {
  return yield {
    type: ServiceActionType.Request,
    payload: {
      serviceName,
      method,
      payload,
    },
  };
}
