import { CrossModuleOwner, defineInlineFunction, defineKeyValueStore, QPQConfig } from 'quidproquo-core';

import { TENANT_CONNECTION_SCOPE_VALIDATOR_FN, TENANT_SCOPE_RESOLVER_FN, USER_TENANT_LINKS_STORE } from '../constants/tenantStoreNames';
import { UserTenantLinks } from '../models/UserTenantLinks';

// Everything a service needs to tenant-scope its storage: the scope-resolver
// inline function (wired via each eventDoc collection's `scopeResolver`
// option), the connection-scope validator (wired via the websocket queue's
// `connectionScopeValidator` option) and, for services that do NOT own the
// tenant stores, a cross-module re-declaration of the membership table so both
// can validate locally. Pass the owning service as `linksOwner` (e.g.
// { module: 'ca' }); omit it in the owning service (defineTenant composes this
// with no owner).
export const defineTenantScopeResolver = (linksOwner?: CrossModuleOwner): QPQConfig => [
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
      relativePath: '../logic/askTenantConnectionScopeValidator',
      functionName: 'askTenantConnectionScopeValidator',
    },
    { functionName: TENANT_CONNECTION_SCOPE_VALIDATOR_FN },
  ),

  ...(linksOwner ? [defineKeyValueStore<UserTenantLinks>(USER_TENANT_LINKS_STORE, 'userId', [], { owner: linksOwner })] : []),
];
