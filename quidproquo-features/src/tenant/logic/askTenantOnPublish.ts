import { AskResponse } from 'quidproquo-core';

import { EventDocOnPublishInput } from '../../eventDoc/models';
import { askTenantRecordUpsert } from '../data/askTenantRecordUpsert';
import { foldTenantDocument } from '../fold/foldTenantDocument';
import { TenantRecord } from '../models/TenantRecord';
import { TenantStatus } from '../models/TenantStatus';

// The tenant collection's onPublish inline function: fold the log the append
// hands over (no re-read) and materialize the tenant record. Idempotent by
// construction (a plain upsert of the fold result), so publish retries and
// repair re-runs are safe.
export function* askTenantOnPublish(input: EventDocOnPublishInput): AskResponse<void> {
  const doc = foldTenantDocument(input.events);

  const record: TenantRecord = {
    tenantId: input.docId,
    name: input.summary.name,
    brandColors: doc.brandColors,
    logo: doc.logo,
    createdAt: input.summary.createdAt,
    updatedAt: input.summary.updatedAt,
    createdByUserId: input.summary.createdBy,
    status: input.summary.deletedAt ? TenantStatus.deleted : TenantStatus.active,
  };

  yield* askTenantRecordUpsert(record);
}
