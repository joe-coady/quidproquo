import { QpqIsoDateTime } from 'quidproquo-core';

import { TenantStatus } from './TenantStatus';

// The materialized tenant row (pk = tenantId) - the fast path for membership
// checks and branding lookups. Derived from the tenant eventDoc on publish;
// never written directly by request handlers.
export type TenantRecord = {
  tenantId: string;
  name: string;
  brandColors?: Record<string, string>;
  logoUrl?: string;
  createdAt: QpqIsoDateTime;
  updatedAt: QpqIsoDateTime;
  createdByUserId: string;
  status: TenantStatus;
};
