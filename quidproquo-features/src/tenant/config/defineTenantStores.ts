import { defineKeyValueStore, QPQConfig } from 'quidproquo-core';

import { defineEventDocSummary } from '../../eventDoc/config/defineEventDocSummary';
import { TENANT_EVENTDOC_STORE, TENANT_RECORD_STORE, USER_TENANT_LINKS_STORE } from '../constants/tenantStoreNames';
import { TenantRecord } from '../models/TenantRecord';
import { UserTenantLinks } from '../models/UserTenantLinks';

// The tenant eventDoc collection (summary + event log + asset drive) plus the
// two plain tables: the materialized record store and the membership links.
export const defineTenantStores = (): QPQConfig => [
  defineEventDocSummary(TENANT_EVENTDOC_STORE),
  defineKeyValueStore<TenantRecord>(TENANT_RECORD_STORE, 'tenantId'),
  defineKeyValueStore<UserTenantLinks>(USER_TENANT_LINKS_STORE, 'userId'),
];
