import { AskResponse } from 'quidproquo-core';

import { askUserTenantLinksGet } from '../data/askUserTenantLinksGet';

export function* askTenantValidateMembership(userId: string, tenantId: string): AskResponse<boolean> {
  const links = yield* askUserTenantLinksGet(userId);
  return links?.tenantIds.includes(tenantId) ?? false;
}
