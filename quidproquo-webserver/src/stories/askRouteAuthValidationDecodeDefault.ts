import { askCatch, AskResponse, askUserDirectoryDecodeAccessToken, DecodedAccessToken } from 'quidproquo-core';

import { RouteAuthValidationDecodeActionPayload } from '../actions/routeAuthValidation';
import { getHeaderValue } from '../utils/headerUtils';

export function* askRouteAuthValidationDecodeDefault({
  event,
  routeAuthSettings,
  ignoreExpiration,
}: RouteAuthValidationDecodeActionPayload): AskResponse<DecodedAccessToken | null> {
  if (!routeAuthSettings.userDirectoryName) {
    return null;
  }

  const authHeader = getHeaderValue('Authorization', event.headers);
  if (!authHeader) {
    return null;
  }

  const [authType, accessToken] = authHeader.split(' ');
  if (authType !== 'Bearer' || !accessToken) {
    return null;
  }

  const result = yield* askCatch(
    askUserDirectoryDecodeAccessToken(routeAuthSettings.userDirectoryName, ignoreExpiration, accessToken),
  );

  if (!result.success) {
    return null;
  }

  return result.result;
}
