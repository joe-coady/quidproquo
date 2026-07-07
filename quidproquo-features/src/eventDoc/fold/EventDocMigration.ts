import { EventDocDocument } from '../models';

// A pure single-step state migration (e.g. v1 -> v2). The fold stamps the new
// schemaVersion, so a migration only transforms the data fields.
export type EventDocMigration = (state: EventDocDocument) => EventDocDocument;
