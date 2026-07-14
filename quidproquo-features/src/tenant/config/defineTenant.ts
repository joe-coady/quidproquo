import { defineInlineFunction, defineKeyValueStore, defineServiceSettings, QPQConfig } from 'quidproquo-core';

import { defineEventDocRoutes } from '../../eventDoc/routes/defineEventDocRoutes';
import {
  TENANT_CONNECTION_SCOPE_RESOLVER_FN,
  TENANT_DOC_TYPE,
  TENANT_EVENTDOC_STORE,
  TENANT_ON_PUBLISH_FN,
  TENANT_SCOPE_RESOLVER_FN,
  USER_TENANT_LINKS_STORE,
} from '../constants/tenantStoreNames';
import { UserTenantLinks } from '../models/UserTenantLinks';
import { defineTenantRoutes } from '../routes/defineTenantRoutes';
import { TenantOptions } from '../types/TenantRoutesOptions';
import { defineTenantStores } from './defineTenantStores';

// Org/tenant support, declared identically in every service (pass the same
// `owner` everywhere). What materialises depends on the deploying service:
//
// - Everywhere: the scope-resolver + connection-scope-resolver inline functions
//   (a service tenant-scopes its OTHER collections via the request resolver, and
//   resolves ws connection scopes via the connection resolver).
// - Owner deploy only: the registry stores (eventDoc collection + record store +
//   membership links), the publish -> record sync, the generic eventDoc CRUD under
//   {basePath}/docs, and the tenant routes at {basePath}.
// - Every non-owner deploy: a cross-module ref to the membership table, so the
//   resolver can check membership locally against the owner's table.
//
// The tenant collection is an ORDINARY tenanted collection: a tenant doc lives
// in whatever scope the request that created it ran under (the creator's
// personal partition, or the active tenant when an org creates a sub-tenant),
// and the routes resolve their scope with the same standard header resolver as
// every other collection - so a tenant doc is only visible/editable from the
// scope that owns it. The cross-scope registry surface is the membership links
// table + the materialized record store, both unscoped.
export const defineTenant = ({ owner, ...routeOptions }: TenantOptions): QPQConfig => [
  defineInlineFunction(
    {
      basePath: __dirname,
      relativePath: '../logic/askTenantScopeResolver',
      functionName: 'askTenantScopeResolver',
    },
    { functionName: TENANT_SCOPE_RESOLVER_FN },
  ),
  defineInlineFunction(
    {
      basePath: __dirname,
      relativePath: '../logic/askTenantConnectionScopeResolver',
      functionName: 'askTenantConnectionScopeResolver',
    },
    { functionName: TENANT_CONNECTION_SCOPE_RESOLVER_FN },
  ),

  // The membership table: created on the owner's deploy, a read-only cross-module
  // ref on every other service's (the resolver checks membership against it). The
  // owner field alone decides which - no service-gating needed.
  defineKeyValueStore<UserTenantLinks>(USER_TENANT_LINKS_STORE, 'userId', [], { owner }),

  // The rest of the registry (owner-only): the eventDoc collection + record store,
  // the publish sync, the eventDoc CRUD, and the tenant management routes.
  defineServiceSettings({
    [owner.module]: [
      ...defineTenantStores(),
      defineInlineFunction(
        {
          basePath: __dirname,
          relativePath: '../logic/askTenantOnPublish',
          functionName: 'askTenantOnPublish',
        },
        { functionName: TENANT_ON_PUBLISH_FN },
      ),
      defineEventDocRoutes({
        storeName: TENANT_EVENTDOC_STORE,
        type: TENANT_DOC_TYPE,
        basePath: `${routeOptions.basePath}/docs`,
        routeAuthSettings: routeOptions.routeAuthSettings,
        version: routeOptions.version,
        onPublish: TENANT_ON_PUBLISH_FN,
        scopeResolver: TENANT_SCOPE_RESOLVER_FN,
      }),
      defineTenantRoutes(routeOptions),
    ],
  }),
];
