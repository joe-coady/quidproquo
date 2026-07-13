import { defineKeyValueStore, QPQConfig } from 'quidproquo-core';

import { defineEventDocSummary } from '../../eventDoc/config/defineEventDocSummary';
import { TENANT_EVENTDOC_STORE, TENANT_RECORD_STORE } from '../constants/tenantStoreNames';
import { TenantRecord } from '../models/TenantRecord';

// The owner-only tenant stores: the eventDoc collection (summary + event log +
// asset drive) and the materialized record store. The membership links table is
// declared separately by defineTenant (every service refs it via its owner).
export const defineTenantStores = (): QPQConfig => [
  defineEventDocSummary(TENANT_EVENTDOC_STORE),
  defineKeyValueStore<TenantRecord>(TENANT_RECORD_STORE, 'tenantId'),
];
