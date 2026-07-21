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
// the all-old-version-log case. The tail may legitimately mix versions — events
// authored before a module upgrade keep their old version, newer ones follow at the
// new version — but it must be MONOTONICALLY NON-DECREASING (the same rule the
// backend append enforces): migrations only climb, so an event authored below the
// already-folded version would corrupt the view (a stale client's buffer), and it
// throws. The floor starts at the base's version only when the base is a real folded
// doc: a PRISTINE base (no INIT_STATE folded yet — identifiable by its empty id,
// since real logs always open with INIT_STATE) carries the latest version as its
// seed default without a single event behind it, and must not reject an old-version
// tail restored mid-load (snapshot hand-off before the history fetch lands).
export const foldEventDocLiveView = <TState extends EventDocDocument>(
  base: EventDocDocument,
  pending: EventDocEvent[],
  { reducer, migrations, latestVersion }: FoldEventDocLiveViewConfig<TState>,
): TState => {
  let state: EventDocDocument = base;
  let versionFloor = base.id !== '' ? base.schemaVersion : 0;

  for (const event of pending) {
    const eventVersion = event.payload.metadata.version;

    if (eventVersion < versionFloor) {
      throw new Error(
        `Cannot fold pending event '${event.type}' at schema version ${eventVersion} - the document has already folded to version ${versionFloor}; pending event versions must be non-decreasing.`,
      );
    }

    versionFloor = eventVersion;
    state = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion });
  }

  return migrateEventDocDocumentTo(state, latestVersion, migrations) as TState;
};
