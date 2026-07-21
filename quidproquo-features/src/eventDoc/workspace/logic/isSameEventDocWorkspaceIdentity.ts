import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';

// Snapshot pending is only restorable into the SAME document — a snapshot taken
// against one doc must never seed edits into another.
export const isSameEventDocWorkspaceIdentity = (a: EventDocWorkspaceDocumentIdentity, b: EventDocWorkspaceDocumentIdentity): boolean =>
  a.serviceName === b.serviceName && a.basePath === b.basePath && a.id === b.id;
