import { createActionRequester, DecodedAccessToken } from 'quidproquo-core';
import { RouteAuthSettings } from '../../config/settings/route';
import { HTTPEvent } from '../../types/HTTPEvent';
import { RouteAuthValidationActionType } from './RouteAuthValidationActionType';

export const askRouteAuthValidationDecode = createActionRequester<DecodedAccessToken | null>()({
  actionType: RouteAuthValidationActionType.Decode,
  getPayload: (event: HTTPEvent, routeAuthSettings: RouteAuthSettings, ignoreExpiration: boolean) => ({ event, routeAuthSettings, ignoreExpiration }),
});
