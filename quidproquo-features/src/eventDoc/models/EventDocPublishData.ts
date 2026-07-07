import { QpqIsoDateTime } from 'quidproquo-core';

// PUBLISH payload. `effectiveFrom` drives as-of version selection when rendering (later);
// stored on the event now so the log is forward-compatible.
export type EventDocPublishData = {
  effectiveFrom: QpqIsoDateTime;
};
