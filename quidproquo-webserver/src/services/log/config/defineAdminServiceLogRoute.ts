import { HTTPMethod } from 'quidproquo-core';

import { ApiKeyReference } from '../../../config/settings/apiKey';
import { defineRoute, GenericRouteOptions } from '../../../config/settings/route';
import { getServiceEntryQpqFunctionRuntime } from '../../getServiceEntryQpqFunctionRuntime';

export const defineAdminServiceLogRoute = (
  method: HTTPMethod,
  urlPath: string,
  methodName: string,
  options: GenericRouteOptions<ApiKeyReference | string> = {},
) => {
  const qpqRuntime = getServiceEntryQpqFunctionRuntime('log', 'controller', `logController::${methodName}`);

  return defineRoute(method, urlPath, qpqRuntime, options);
};
