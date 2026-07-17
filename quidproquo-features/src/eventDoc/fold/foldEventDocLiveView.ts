import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocMigrations } from './EventDocMigrations';
import { foldEventDocLogStep } from './foldEventDocLogStep';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

export type FoldEventDocLiveViewConfig<TState extends EventDocDocument> = {
  reducer: QpqReducer<TState, EventDocEvent>;
  migrations: EventDocMigrations;
  latestVersion: number;
};

// The READ-side fold: apply the pending (unsaved) tail onto a stored history
// accumulator, then migrate the result to the latest version. The stored accumulator
// sits at its LAST FOLDED EVENT's version (it is deliberately not migrated at write —
// see the workspace's foldHistoryEventsIntoAccumulator), so the migrate at the END is
// what makes every read latest-shaped; it runs even with no pending, which is exactly
// the all-old-version-log case. Pending events must be authored at the slot's latest
// version — anything else is a stale client whose events would corrupt the view, so
// it throws.
export const foldEventDocLiveView = <TState extends EventDocDocument>(
  base: EventDocDocument,
  pending: EventDocEvent[],
  { reducer, migrations, latestVersion }: FoldEventDocLiveViewConfig<TState>,
): TState => {
  let state: EventDocDocument = base;

  for (const event of pending) {
    const eventVersion = event.payload.metadata.version;

    if (eventVersion !== latestVersion) {
      throw new Error(
        `Cannot fold pending event '${event.type}' at schema version ${eventVersion} - pending events must be authored at the slot's latest version (${latestVersion}).`,
      );
    }

    state = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion });
  }

  return migrateEventDocDocumentTo(state, latestVersion, migrations) as TState;
};
