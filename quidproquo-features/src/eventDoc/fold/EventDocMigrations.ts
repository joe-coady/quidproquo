import { EventDocMigration } from './EventDocMigration';

// Single-step migrations keyed by TARGET version: migrations[N] takes v(N-1) to vN.
// Must cover 2..latest with no gaps — the fold climbs one step at a time and throws
// on a missing step.
export type EventDocMigrations = Record<number, EventDocMigration>;
