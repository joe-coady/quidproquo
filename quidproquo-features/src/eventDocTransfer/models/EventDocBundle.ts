import { EventDocBundleDoc } from './EventDocBundleDoc';
import { EventDocBundleSource } from './EventDocBundleSource';

// The transfer artifact: one JSON file holding a manifest of docs. Plain JSON with asset bytes
// base64-inlined (QPQBinaryData) rather than an archive, so both ends are JSON.parse and
// JSON.stringify with no dependency and no streaming.
export type EventDocBundle = {
  formatVersion: number;
  source: EventDocBundleSource;
  docs: EventDocBundleDoc[];
};
