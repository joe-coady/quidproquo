import { EventDocDocument } from '../models';
import { EventDocMigrations } from './EventDocMigrations';

// Climb the single-step migration chain until the state reaches `target`, stamping the
// new schemaVersion at each step (migrations never touch it). A target at or below the
// current version is a no-op; a missing step throws (the chain must cover 2..latest
// with no gaps).
export const migrateEventDocDocumentTo = (state: EventDocDocument, target: number, migrations: EventDocMigrations): EventDocDocument => {
  let migrated = state;

  while (migrated.schemaVersion < target) {
    const next = migrated.schemaVersion + 1;
    const migrate = migrations[next];

    if (!migrate) {
      throw new Error(`No event-doc migration to version ${next} (registered: ${Object.keys(migrations).join(', ') || 'none'}).`);
    }

    migrated = { ...migrate(migrated), schemaVersion: next };
  }

  return migrated;
};
