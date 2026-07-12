// The tenant eventDoc collection (audit-trailed source of truth for tenant state).
export const TENANT_EVENTDOC_STORE = 'tenants';
export const TENANT_DOC_TYPE = 'tenant';

// Materialized fast-read table, synced from the eventDoc on publish.
export const TENANT_RECORD_STORE = 'tenantRecords';

// userId -> tenantIds membership links.
export const USER_TENANT_LINKS_STORE = 'userTenantLinks';

// Inline-function name for the publish -> record-store sync.
export const TENANT_ON_PUBLISH_FN = 'askTenantOnPublish';

// Inline-function name for the eventDoc `scopeResolver` hook: resolves the
// request's optional tenant header into a validated storage scope.
export const TENANT_SCOPE_RESOLVER_FN = 'askTenantScopeResolver';

// Inline-function name for the websocket queue's `connectionScopeValidator`
// hook: membership-checks a tenant claimed in the ws Authenticate handshake.
export const TENANT_CONNECTION_SCOPE_VALIDATOR_FN = 'askTenantConnectionScopeValidator';
