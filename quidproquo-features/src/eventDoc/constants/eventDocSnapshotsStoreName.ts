// Snapshots-table name derived by convention so a collection needs only one storeName —
// same scheme as eventDocEventsStoreName. The suffix is terse ("SS", not "Snapshots")
// deliberately: store names are compounded into physical resource names (table + stream +
// handler ids) that carry the app, environment and service on top, and the long form
// pushes real deployments into name-length limits.
export const eventDocSnapshotsStoreName = (storeName: string): string => `${storeName}SS`;
