import { EventDocDocument } from '../models';
import { EventDocMigration } from './EventDocMigration';
import { EventDocMigrations } from './EventDocMigrations';

// Type-safe migration-chain builder: each `.to`'s output becomes the next step's
// input, so adjacent steps are forced to line up (v1 -> v2 -> v3) and a wrong shape
// won't compile. schemaVersion is Omit-ted — the fold stamps it, never a migration.
// Contiguity/reaching latest is a runtime guard (fold throws on a missing step),
// not a type guard; `.build()` erases to the loose EventDocMigrations.
export type MigrationChain<TCurrent extends EventDocDocument> = {
  to: <TNext extends EventDocDocument>(version: number, migrate: (state: TCurrent) => Omit<TNext, 'schemaVersion'>) => MigrationChain<TNext>;
  build: () => EventDocMigrations;
};

export const migrationChain = <TBase extends EventDocDocument = EventDocDocument>(): MigrationChain<TBase> => {
  const extend = <TCurrent extends EventDocDocument>(migrations: EventDocMigrations): MigrationChain<TCurrent> => ({
    to: <TNext extends EventDocDocument>(version: number, migrate: (state: TCurrent) => Omit<TNext, 'schemaVersion'>): MigrationChain<TNext> =>
      extend<TNext>({
        ...migrations,
        [version]: migrate as unknown as EventDocMigration,
      }),
    build: () => migrations,
  });

  return extend<TBase>({});
};
