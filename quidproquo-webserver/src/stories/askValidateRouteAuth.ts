import { AskResponse } from 'quidproquo-core';

import { askApiKeyValidationValidate } from '../actions/apiKeyValidation';
import { askRouteAuthValidationDecode } from '../actions/routeAuthValidation';
import { RouteAuthSettings } from '../config/settings/route';
import { HTTPEvent } from '../types/HTTPEvent';
import { getHeaderValue } from '../utils/headerUtils';

export interface ValidateRouteAuthPayload {
  event: HTTPEvent;
  routeAuthSettings?: RouteAuthSettings;
}

export function* askValidateRouteAuth({ event, routeAuthSettings }: ValidateRouteAuthPayload): AskResponse<boolean> {
  if (!routeAuthSettings) {
    return true;
  }

  // Token auth validation via swappable action
  if (routeAuthSettings.userDirectoryName) {
    const decoded = yield* askRouteAuthValidationDecode(event, routeAuthSettings, false);
    if (!decoded || !decoded.wasValid) {
      return false;
    }
  }

  // API key validation via action
  const apiKeys = routeAuthSettings.apiKeys || [];
  if (apiKeys.length > 0) {
    const apiKeyHeader = getHeaderValue('x-api-key', event.headers);
    if (!apiKeyHeader) {
      return false;
    }

    const valid = yield* askApiKeyValidationValidate(apiKeyHeader, apiKeys);
    if (!valid) {
      return false;
    }
  }

  return true;
}
