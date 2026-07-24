import { HTTPMethod } from 'quidproquo-core';
import { ApiKeyReference } from 'quidproquo-webserver';
import { defineRoute, GenericRouteOptions } from 'quidproquo-webserver';

import { getFeatureEntryQpqFunctionRuntime } from '../../../getFeatureEntryQpqFunctionRuntime';

export const defineAdminServiceMaintenanceRoute = (
  method: HTTPMethod,
  urlPath: string,
  methodName: string,
  options: GenericRouteOptions<ApiKeyReference | string> = {},
) => {
  const qpqRuntime = getFeatureEntryQpqFunctionRuntime('admin/maintenance', 'controller', `maintenanceController::${methodName}`);

  return defineRoute(method, urlPath, qpqRuntime, options);
};
