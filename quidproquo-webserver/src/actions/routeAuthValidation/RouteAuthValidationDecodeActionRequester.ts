import { RouteAuthSettings } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { RouteAuthValidationActionType } from './RouteAuthValidationActionType';
import { RouteAuthValidationDecodeActionRequester } from './RouteAuthValidationDecodeActionTypes';

export function* askRouteAuthValidationDecode(
  event: HTTPEvent,
  routeAuthSettings: RouteAuthSettings,
  ignoreExpiration: boolean,
): RouteAuthValidationDecodeActionRequester {
  return yield {
    type: RouteAuthValidationActionType.Decode,
    payload: {
      event,
      routeAuthSettings,
      ignoreExpiration,
    },
  };
}
