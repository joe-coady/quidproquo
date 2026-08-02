import {
  askCatch,
  askFileReadTextContents,
  askKeyValueStoreQuery,
  AskResponse,
  kvsAnd,
  kvsEqual,
  kvsLessThanOrEqual,
  Nullable,
} from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EVENT_DOC_PRIMARY_VIEW } from '../definition/types/EventDocLatestViews';
import { EventDocSnapshotSeed, EventDocSnapshotViews } from '../models';
import { eventDocSnapshotPk, EventDocStoredSnapshot } from '../types/EventDocStoredSnapshot';
import { askEventDocResolveScope } from './askEventDocResolveScope';
import { eventDocSnapshotPath } from './eventDocSnapshotPath';

// A snapshot row's state, wherever it lives: on the row, or offloaded on the blob drive at
// the path derived from the row's own keys. A missing/unreadable blob resolves to null —
// the caller treats the whole seed as unusable rather than folding a view from nothing.
function* askResolveSnapshotState(docId: string, viewName: string, row: EventDocStoredSnapshot): AskResponse<Nullable<{ state: unknown }>> {
  if (row.data.type === 'inline') {
    return { state: row.data.snapshot };
  }

  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const read = yield* askCatch(askFileReadTextContents(storageDriveName, eventDocSnapshotPath(docId, viewName, row.sk), scope));

  return read.success ? { state: JSON.parse(read.result) } : null;
}

/**
 * Load the newest COMPLETE snapshot at or before `upToEventId` — the seed an incremental
 * fold resumes from — or null when there is nothing usable and the caller should fold the
 * whole prefix from scratch.
 *
 * Anchors on the DOCUMENT view's row: its name is the one package constant a generic
 * reader can address (every other view name lives inside a partition key it cannot
 * enumerate), and it is written last with the manifest of its siblings, so its presence
 * means the whole set landed. From the manifest, every sibling row at the same event is
 * gathered; any hole (a pre-manifest snapshot, a missing row or blob) makes the whole
 * seed null — a partial seed would silently fold the missing view from nothing, which is
 * worse than paying for one from-scratch fold.
 *
 * Reads are eventually consistent on purpose: the seed is an optimisation, not a
 * correctness input. A replica that has not caught up simply surfaces an older seed (or
 * none), and the fold does a little more work for the same answer.
 */
export function* askEventDocSnapshotSeedLatest(docId: string, upToEventId: string): AskResponse<Nullable<EventDocSnapshotSeed>> {
  const { snapshotsStoreName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const documentPage = yield* askKeyValueStoreQuery<EventDocStoredSnapshot>(
    snapshotsStoreName,
    kvsAnd([kvsEqual('pk', eventDocSnapshotPk(docId, EVENT_DOC_PRIMARY_VIEW)), kvsLessThanOrEqual('sk', upToEventId)]),
    { sortAscending: false, limit: 1, scope },
  );

  const documentRow = documentPage.items[0];

  if (!documentRow?.data.views) {
    return null;
  }

  const views: EventDocSnapshotViews = {};

  for (const viewName of documentRow.data.views) {
    const row =
      viewName === EVENT_DOC_PRIMARY_VIEW
        ? documentRow
        : (yield* askKeyValueStoreQuery<EventDocStoredSnapshot>(
            snapshotsStoreName,
            kvsAnd([kvsEqual('pk', eventDocSnapshotPk(docId, viewName)), kvsEqual('sk', documentRow.sk)]),
            { limit: 1, scope },
          )).items[0];

    if (!row) {
      return null;
    }

    const resolved = yield* askResolveSnapshotState(docId, viewName, row);

    if (!resolved) {
      return null;
    }

    views[viewName] = resolved.state;
  }

  return { eventId: documentRow.sk, views };
}
