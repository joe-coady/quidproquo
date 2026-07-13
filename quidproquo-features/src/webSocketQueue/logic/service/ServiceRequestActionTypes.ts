import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { ServiceActionType } from './ServiceActionType';

export interface ServiceRequestActionPayload<TPayload> {
  serviceName: string;
  method: string;
  payload: TPayload;
}

export interface ServiceRequestAction<TPayload> extends Action<ServiceRequestActionPayload<TPayload>> {
  type: ServiceActionType.Request;
  payload: ServiceRequestActionPayload<TPayload>;
}

export type ServiceRequestActionProcessor<TPayload, TResponse> = ActionProcessor<ServiceRequestAction<TPayload>, TResponse>;
export type ServiceRequestActionRequester<TPayload, TResponse> = ActionRequester<ServiceRequestAction<TPayload>, TResponse>;
