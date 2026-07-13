import { QpqIsoDateTime } from 'quidproquo-core';

import { EventDocAssetRef } from '../../eventDoc/models';
import { TenantBrandColors } from './TenantBrandColors';
import { TenantStatus } from './TenantStatus';

// The materialized tenant row (pk = tenantId) - the fast path for membership
// checks and branding lookups. Derived from the tenant eventDoc on publish;
// never written directly by request handlers. The logo is stored as an asset
// ref; callers resolve it to a presigned URL at read time.
export type TenantRecord = {
  tenantId: string;
  name: string;
  brandColors?: TenantBrandColors;
  logo?: EventDocAssetRef;
  createdAt: QpqIsoDateTime;
  updatedAt: QpqIsoDateTime;
  createdByUserId: string;
  status: TenantStatus;
};
