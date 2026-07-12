import { defineInlineFunction, QPQConfig } from 'quidproquo-core';

import { defineEventDocRoutes } from '../../eventDoc/routes/defineEventDocRoutes';
import { TENANT_DOC_TYPE, TENANT_EVENTDOC_STORE, TENANT_ON_PUBLISH_FN } from '../constants/tenantStoreNames';
import { defineTenantRoutes } from '../routes/defineTenantRoutes';
import { TenantRoutesOptions } from '../types/TenantRoutesOptions';
import { defineTenantScopeResolver } from './defineTenantScopeResolver';
import { defineTenantStores } from './defineTenantStores';

// Everything a service needs for org/tenant support:
// - the stores (eventDoc collection + record store + membership links)
// - the publish -> record-store sync inline function
// - the scope-resolver inline function (so this service can tenant-scope its
//   OTHER collections; the tenant collection itself stays unscoped - it is
//   the registry)
// - the generic eventDoc CRUD under {basePath}/docs (SET_BRAND appends, publish, audit history)
// - the tenant routes at {basePath} (list-my-tenants / create / get-record)
export const defineTenant = (options: TenantRoutesOptions): QPQConfig => [
  defineTenantStores(),
  defineInlineFunction(
    {
      basePath: __dirname,
      relativePath: '../logic/askTenantOnPublish',
      functionName: 'askTenantOnPublish',
    },
    { functionName: TENANT_ON_PUBLISH_FN },
  ),
  defineTenantScopeResolver(),
  defineEventDocRoutes({
    storeName: TENANT_EVENTDOC_STORE,
    type: TENANT_DOC_TYPE,
    basePath: `${options.basePath}/docs`,
    routeAuthSettings: options.routeAuthSettings,
    version: options.version,
    onPublish: TENANT_ON_PUBLISH_FN,
  }),
  defineTenantRoutes(options),
];
