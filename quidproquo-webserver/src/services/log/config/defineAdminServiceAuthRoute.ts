import { HTTPMethod, QpqFunctionRuntime } from 'quidproquo-core';

import { ApiKeyReference, defineRoute, GenericRouteOptions } from '../../../config';
import { getServiceEntryQpqFunctionRuntime } from '../../getServiceEntryQpqFunctionRuntime';

export const defineAdminServiceAuthRoute = (
  method: HTTPMethod,
  urlPath: string,
  methodName: string,
  options: GenericRouteOptions<ApiKeyReference | string> = {},
) => {
  const qpqRuntime: QpqFunctionRuntime = getServiceEntryQpqFunctionRuntime('log', 'controller', `loginController::${methodName}`);

  return defineRoute(method, urlPath, qpqRuntime, options);
};
