import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocMigrations } from './EventDocMigrations';
import { foldEventDocLogStep } from './foldEventDocLogStep';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

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
// The per-event body lives in foldEventDocLogStep, shared with the workspace's
// incremental historyViews fold so the two can't drift.
export const foldEventDocLog = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  { seed, reducer, migrations, latestVersion }: FoldEventDocLogConfig<TState>,
): TState => {
  let state: EventDocDocument = { ...seed };

  for (const event of events) {
    state = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion });
  }

  return migrateEventDocDocumentTo(state, latestVersion, migrations) as TState;
};
