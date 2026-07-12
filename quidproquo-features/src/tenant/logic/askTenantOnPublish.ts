import { AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll } from '../../eventDoc/data/askEventDocEventListAll';
import { EventDocOnPublishInput } from '../../eventDoc/models';
import { askTenantRecordUpsert } from '../data/askTenantRecordUpsert';
import { foldTenantDocument } from '../fold/foldTenantDocument';
import { TenantRecord } from '../models/TenantRecord';
import { TenantStatus } from '../models/TenantStatus';

// The tenant collection's onPublish inline function: re-fold the full log and
// materialize the tenant record. Idempotent by construction (a plain upsert of
// the fold result), so publish retries and repair re-runs are safe.
export function* askTenantOnPublish(input: EventDocOnPublishInput): AskResponse<void> {
  const events = yield* askEventDocEventListAll(input.docId);
  const doc = foldTenantDocument(events);

  const record: TenantRecord = {
    tenantId: input.docId,
    name: input.summary.name,
    brandColors: doc.brandColors,
    logoUrl: doc.logoUrl,
    createdAt: input.summary.createdAt,
    updatedAt: input.summary.updatedAt,
    createdByUserId: input.summary.createdBy,
    status: input.summary.deletedAt ? TenantStatus.deleted : TenantStatus.active,
  };

  yield* askTenantRecordUpsert(record);
}
