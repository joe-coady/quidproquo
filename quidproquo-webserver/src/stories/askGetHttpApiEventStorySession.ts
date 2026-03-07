import { AskResponse, StorySession } from 'quidproquo-core';

import { askRouteAuthValidationDecode } from '../actions/routeAuthValidation';
import { RouteAuthSettings } from '../config/settings/route';
import { HTTPEvent } from '../types/HTTPEvent';
import { getAccessTokenFromHeaders } from '../utils/headerUtils';
import { decodeJWT } from '../utils/jwtUtils';

export interface GetHttpApiEventStorySessionPayload {
  event: HTTPEvent;
  routeAuthSettings?: RouteAuthSettings;
  session: StorySession;
}

export function* askGetHttpApiEventStorySession({
  event,
  routeAuthSettings,
  session,
}: GetHttpApiEventStorySessionPayload): AskResponse<StorySession | undefined> {
  const accessToken = getAccessTokenFromHeaders(event.headers);

  if (!accessToken) {
    return void 0;
  }

  // If this endpoint has no auth settings, BUT we do have an access token
  // then we want to just attempt to extract info for logs, but we will say that its wasValid = false
  if (!routeAuthSettings?.userDirectoryName) {
    const info = decodeJWT<{
      sub?: string;
      userId?: string;
      username?: string;
      id?: string;
      exp?: number;
    }>(accessToken);

    return {
      ...session,

      decodedAccessToken: {
        exp: info?.exp || 0,
        userDirectory: '',
        userId: info?.sub || info?.id || info?.userId || info?.username || '',
        username: info?.username || info?.userId || info?.sub || info?.id || '',
        wasValid: false,
      },
    };
  }

  // Auth was already validated in auto-respond, so we can use ignoreExpiration: true
  const decoded = yield* askRouteAuthValidationDecode(event, routeAuthSettings, true);

  if (!decoded) {
    return void 0;
  }

  return {
    ...session,

    decodedAccessToken: decoded,
  };
}
