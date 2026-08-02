import { QPQConfig, QpqFunctionRuntime } from 'quidproquo-core';

import { defineEventDoc, EventDocCollectionOptions, EventDocFunctions } from '../../eventDoc';
import { TENANT_SCOPE_RESOLVER_FN } from '../constants/tenantStoreNames';

export type TenantedEventDocCollectionOptions = Omit<EventDocCollectionOptions, 'scopeResolver'>;

// A defineEventDoc with the tenant scope resolver pre-wired, so the collection's
// stores and assets partition per tenant (header -> membership check -> TENANT#
// scope) or per user (no header -> PERSONAL# scope) - never unscoped. The
// deploying service must still register the resolver by calling defineTenant.
// Use plain defineEventDoc for collections that never partition.
export const defineTenantedEventDoc = (
  functions: EventDocFunctions,
  runtime: QpqFunctionRuntime,
  options: TenantedEventDocCollectionOptions,
): QPQConfig =>
  defineEventDoc(functions, runtime, {
    ...options,
    scopeResolver: TENANT_SCOPE_RESOLVER_FN,
  });
