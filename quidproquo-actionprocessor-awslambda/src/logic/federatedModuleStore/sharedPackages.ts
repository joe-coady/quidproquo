// The framework packages the lambda host provides to the module-federation share
// scope, so a federated remote resolves the SAME module instances as the host
// (instanceof checks and module-level state stay coherent). Single source of truth
// for BOTH the host runtime (loadFederatedStory getHostSharedModules) and the
// remote build (quidproquo-deploy-webpack getRspackConfigForQpqRemote) — the two
// lists must never drift, or the remote would silently bundle its own copy.
export const FEDERATED_SHARED_PACKAGE_NAMES = ['quidproquo-core', 'quidproquo-webserver'] as const;
