import { HTTPMethod, QPQConfig, QpqFunctionRuntimeAdvanced } from 'quidproquo-core';
import { RouteOptions } from 'quidproquo-webserver';

import { EVENT_DOC_USER_DIRECTORY_GLOBAL } from '../../eventDoc/constants/eventDocGlobalNames';
import { buildEventDocStore } from '../../eventDoc/context/buildEventDocStore';
import { buildEventDocStoreGlobals } from '../../eventDoc/globals/buildEventDocStoreGlobals';
import { defineVersionedRoute } from '../../routes/defineVersionedRoute';
import { DEFAULT_TENANT_HEADER_NAME, TENANT_HEADER_NAME_GLOBAL } from '../constants/tenantGlobalNames';
import { TENANT_DOC_TYPE, TENANT_EVENTDOC_STORE, TENANT_ON_PUBLISH_FN, TENANT_SCOPE_RESOLVER_FN } from '../constants/tenantStoreNames';
import { TenantRoutesOptions } from '../types/TenantRoutesOptions';

// The tenant-specific routes (list-my-tenants / create / get-record). The
// generic eventDoc CRUD (append SET_BRAND, publish, audit history) is mounted
// separately by defineTenant under {basePath}/docs. The store carries the
// STANDARD scope resolver so create/list run under the request's scope like
// every other route - a new tenant doc lands in the caller's current partition
// (personal, or the active tenant), nowhere special.
export const defineTenantRoutes = ({ basePath, routeAuthSettings, version, tenantHeaderName }: TenantRoutesOptions): QPQConfig => {
  const store = buildEventDocStore({
    storeName: TENANT_EVENTDOC_STORE,
    type: TENANT_DOC_TYPE,
    onPublish: TENANT_ON_PUBLISH_FN,
    scopeResolver: TENANT_SCOPE_RESOLVER_FN,
  });

  const globals: Record<string, unknown> = {
    ...buildEventDocStoreGlobals(store),
    [EVENT_DOC_USER_DIRECTORY_GLOBAL]: routeAuthSettings.userDirectoryName,
    [TENANT_HEADER_NAME_GLOBAL]: tenantHeaderName ?? DEFAULT_TENANT_HEADER_NAME,
  };

  const options: RouteOptions = { routeAuthSettings };

  const runtime = (functionName: string): QpqFunctionRuntimeAdvanced => ({
    basePath: __dirname,
    relativePath: `./controllers/${functionName}`,
    functionName,
    globals,
  });

  const route = (method: HTTPMethod, path: string, functionName: string): QPQConfig =>
    defineVersionedRoute(method, path, runtime(functionName), options, version);

  return [route('GET', basePath, 'list'), route('POST', basePath, 'create'), route('GET', `${basePath}/{id}`, 'get')];
};
