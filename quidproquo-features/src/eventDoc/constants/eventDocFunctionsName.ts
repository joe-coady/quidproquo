// The dynamic-functions registry name for a collection's EventDocFunctions object,
// derived by convention from the identity every call site already holds - so the
// per-route globals carry no extra key and any code with a {storeName, type} can
// address the collection's functions (render, collectReferences, foldSnapshotViews).
export const eventDocFunctionsName = (storeName: string, type: string): string => `${storeName}#${type}#eventDocFunctions`;
