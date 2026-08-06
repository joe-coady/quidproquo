import { RouteAuthSettings } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { RouteAuthValidationActionType } from './RouteAuthValidationActionType';

// Payload
export interface RouteAuthValidationDecodeActionPayload {
  event: HTTPEvent;
  routeAuthSettings: RouteAuthSettings;
  ignoreExpiration: boolean;
}
