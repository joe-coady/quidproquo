import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocMigrations } from './EventDocMigrations';

type FoldEventDocLogConfig<TState extends EventDocDocument> = {
  // INIT_STATE resets to the version's initial anyway, so the seed is overwritten;
  // pass the latest version's initial for the empty-log case.
  seed: TState;
  reducer: QpqReducer<TState, EventDocEvent>;
  migrations: EventDocMigrations;
  latestVersion: number;
};

// Migrate the accumulator UP to each event's version BEFORE folding it (events are
// non-decreasing — backend-enforced), so every vN reducer sees its own shape, then
// climb to latestVersion at the end (a v1-only log still resolves to latest). A
// missing migration step throws; a future-version event is clamped out of the target.
export const foldEventDocLog = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  { seed, reducer, migrations, latestVersion }: FoldEventDocLogConfig<TState>
): TState => {
  const migrateTo = (
    state: EventDocDocument,
    target: number
  ): EventDocDocument => {
    let migrated = state;

    while (migrated.schemaVersion < target) {
      const next = migrated.schemaVersion + 1;
      const migrate = migrations[next];

      if (!migrate) {
        throw new Error(
          `No event-doc migration to version ${next} (registered: ${
            Object.keys(migrations).join(', ') || 'none'
          }).`
        );
      }

      migrated = { ...migrate(migrated), schemaVersion: next };
    }

    return migrated;
  };

  let state: EventDocDocument = { ...seed };

  for (const event of events) {
    const target = Math.min(event.payload.metadata.version, latestVersion);
    state = migrateTo(state, target);
    [state] = reducer(state as TState, event);
    state = { ...state, updatedAt: event.payload.metadata.createdAt };
  }

  return migrateTo(state, latestVersion) as TState;
};
