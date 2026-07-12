import { AskResponse, askRunParallel } from 'quidproquo-core';

import { askEventDocGetById } from '../../eventDoc/data/askEventDocGetById';
import { EventDocSummary } from '../../eventDoc/models';
import { askUserTenantLinksGet } from '../data/askUserTenantLinksGet';

// List-my-tenants: membership ids hydrated from the eventDoc SUMMARY store,
// which is written at create time - so a freshly created, never-published
// tenant appears immediately and can be reopened to finish setup. The record
// store stays the fast path for single-tenant reads and branding lookups.
// Requires the tenant eventDoc store context (the tenant routes provide it).
export function* askTenantListForUser(userId: string): AskResponse<EventDocSummary[]> {
  const links = yield* askUserTenantLinksGet(userId);

  // The summary reads are independent, so run them as one batched round trip
  // instead of one sequential read per tenant.
  const summaries = yield* askRunParallel((links?.tenantIds ?? []).map((tenantId) => askEventDocGetById(tenantId)));

  // askEventDocGetById returns soft-deleted rows as-is; hide them here.
  return summaries.filter((summary): summary is EventDocSummary => !!summary && !summary.deletedAt);
}
