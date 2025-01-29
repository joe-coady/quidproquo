import { HTTPMethod, QpqFunctionRuntime } from 'quidproquo-core';

import path from 'path';

import { ApiKeyReference, defineRoute, GenericRouteOptions } from '../../../config';
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
