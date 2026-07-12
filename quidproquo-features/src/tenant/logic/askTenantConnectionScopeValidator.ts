import { AskResponse } from 'quidproquo-core';

import { askTenantValidateMembership } from './askTenantValidateMembership';

// The inline-function implementation behind TENANT_CONNECTION_SCOPE_VALIDATOR_FN:
// the websocket queue's `connectionScopeValidator` hook calls this when an
// Authenticate message claims a tenant, so the claim is membership-checked
// before it is stored on the connection record.
export function* askTenantConnectionScopeValidator(input: { userId: string; requestedScope: string }): AskResponse<boolean> {
  return yield* askTenantValidateMembership(input.userId, input.requestedScope);
}
