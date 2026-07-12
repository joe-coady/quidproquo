import { askNewGuid, AskResponse } from 'quidproquo-core';

import { askEventDocCreate } from '../../eventDoc/logic/askEventDocCreate';
import { EventDocEventActor, EventDocSummary } from '../../eventDoc/models';
import { askUserTenantLinksGet } from '../data/askUserTenantLinksGet';
import { askUserTenantLinksUpsert } from '../data/askUserTenantLinksUpsert';

// Create the tenant eventDoc and link the creator as its first member. Must run
// under the tenant eventDoc store context (the tenant routes provide it).
// Membership is read-modify-write: no invite flow yet, so contention on one
// user's row is negligible.
export function* askTenantCreate(name: string, actor: EventDocEventActor): AskResponse<EventDocSummary> {
  // Tenant identity is the opaque doc id; code is a non-user-facing unique
  // filler required by the eventDoc INIT contract.
  const code = yield* askNewGuid();
  const summary = yield* askEventDocCreate(name, code, actor);

  const links = yield* askUserTenantLinksGet(actor.userId);
  yield* askUserTenantLinksUpsert({
    userId: actor.userId,
    tenantIds: [...(links?.tenantIds ?? []), summary.id],
  });

  return summary;
}
