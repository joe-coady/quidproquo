import { Action, ActionProcessor, ActionRequester, DecodedAccessToken } from 'quidproquo-core';

import { RouteAuthSettings } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { RouteAuthValidationActionType } from './RouteAuthValidationActionType';

// Payload
export interface RouteAuthValidationDecodeActionPayload {
  event: HTTPEvent;
  routeAuthSettings: RouteAuthSettings;
  ignoreExpiration: boolean;
}

// Action
export interface RouteAuthValidationDecodeAction extends Action<RouteAuthValidationDecodeActionPayload> {
  type: RouteAuthValidationActionType.Decode;
  payload: RouteAuthValidationDecodeActionPayload;
}

// Function Types
export type RouteAuthValidationDecodeActionProcessor = ActionProcessor<RouteAuthValidationDecodeAction, DecodedAccessToken | null>;
export type RouteAuthValidationDecodeActionRequester = ActionRequester<RouteAuthValidationDecodeAction, DecodedAccessToken | null>;
