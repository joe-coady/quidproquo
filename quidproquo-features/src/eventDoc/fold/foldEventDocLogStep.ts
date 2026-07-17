import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocMigrations } from './EventDocMigrations';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

export type FoldEventDocLogStepConfig<TState extends EventDocDocument> = {
  reducer: QpqReducer<TState, EventDocEvent>;
  migrations: EventDocMigrations;
  latestVersion: number;
};

// Fold ONE event onto the accumulator: migrate the state UP to the event's version
// (clamped to latestVersion, so a future-version event folds at latest), apply the
// version-routed reducer, stamp updatedAt. This is the exact loop body of
// foldEventDocLog, extracted so the workspace's incremental historyViews fold shares
// its semantics instead of drifting.
export const foldEventDocLogStep = <TState extends EventDocDocument>(
  state: EventDocDocument,
  event: EventDocEvent,
  { reducer, migrations, latestVersion }: FoldEventDocLogStepConfig<TState>,
): EventDocDocument => {
  const target = Math.min(event.payload.metadata.version, latestVersion);

  let next: EventDocDocument = migrateEventDocDocumentTo(state, target, migrations);
  [next] = reducer(next as TState, event);

  return { ...next, updatedAt: event.payload.metadata.createdAt };
};
