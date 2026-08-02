import { EventDocVersion } from './EventDocVersion';

// A resolved version paired with the document state at its head — latest-shaped, folded
// via the snapshot-seeded read (see askEventDocDocumentStateAsOf). Returned by the as-of
// resolvers so a caller can both use the state AND read the version's own stamps: a
// "render published" flow pins its linked docs to `version.publishedAt`, so the state
// alone isn't enough.
export type EventDocVersionState = {
  version: EventDocVersion;
  state: unknown;
};
