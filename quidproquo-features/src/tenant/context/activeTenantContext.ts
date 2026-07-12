import { storageScopeContext } from 'quidproquo-core';

// The active tenant IS the ambient storage scope: scope-aware data layers (the
// eventDoc feature, the askTenant* wrappers) forward it as the File/KVS scope.
// Non-local by design - it rides the serialized session context across queue
// and service boundaries, so async work spawned inside a tenant request (a
// render job, an AI edit) lands in the same tenant partition. Null = Personal.
export const activeTenantContext = storageScopeContext;
