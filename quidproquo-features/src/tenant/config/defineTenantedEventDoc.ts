import { QPQConfig } from 'quidproquo-core';

import { defineEventDoc, EventDocRoutesOptions } from '../../eventDoc';
import { TENANT_SCOPE_RESOLVER_FN } from '../constants/tenantStoreNames';

export type TenantedEventDocOptions = Omit<EventDocRoutesOptions, 'scopeResolver'>;

// A defineEventDoc with the tenant scope resolver pre-wired, so the collection's
// stores and assets partition per tenant (header -> membership check -> tenant id;
// unscoped for Personal). The deploying service must still register the resolver
// by calling defineTenant. Use plain defineEventDoc for collections that never partition.
export const defineTenantedEventDoc = (options: TenantedEventDocOptions): QPQConfig =>
  defineEventDoc({
    ...options,
    scopeResolver: TENANT_SCOPE_RESOLVER_FN,
  });
