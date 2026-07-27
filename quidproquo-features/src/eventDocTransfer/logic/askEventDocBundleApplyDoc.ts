import { AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll } from '../../eventDoc/data';
import { EventDocEvent } from '../../eventDoc/models';
import { EventDocBundleApplyOptions, EventDocBundleDoc, EventDocTransferPlanRow, EventDocTransferStatus } from '../models';
import { askEventDocBundlePlanDoc } from './askEventDocBundlePlanDoc';
import { askEventDocTransferTruncateLog } from './askEventDocTransferTruncateLog';
import { askEventDocTransferWriteAssets } from './askEventDocTransferWriteAssets';
import { askEventDocWriteForeignEvents } from './askEventDocWriteForeignEvents';
import { findEventDocLogDivergence } from './findEventDocLogDivergence';

// Only these two statuses write anything unasked. Everything else is either already satisfied (Same)
// or blocking (Diverged, CodeConflict, Ignored).
const isWritable = (status: EventDocTransferStatus): boolean =>
  status === EventDocTransferStatus.New || status === EventDocTransferStatus.FastForward;

// Force applies to divergence ONLY. A code conflict means a DIFFERENT doc in the target owns this
// code, so discarding this doc's tail would not resolve anything - that one needs a human to rename
// or remove the other doc.
const isForceable = (status: EventDocTransferStatus): boolean => status === EventDocTransferStatus.Diverged;

// Where the target's log stops agreeing with the bundle, and therefore where an overwrite cuts. A
// divergence cuts at the first disagreement; a target that is merely AHEAD cuts at the end of the
// bundle's log, dropping the extra tail.
const overwriteFromIndex = (existingEvents: EventDocEvent[], incoming: EventDocEvent[]): number => {
  const comparison = findEventDocLogDivergence(existingEvents, incoming);

  return comparison.diverged ? comparison.atIndex : comparison.sharedCount;
};

/**
 * Import ONE doc, re-planning it first so the decision is made against the state as it is right now
 * rather than against a plan the operator looked at minutes ago. Runs inside the doc's collection
 * store.
 *
 * `existingEvents` from the fresh plan IS the fast-forward point: when the logs have not diverged and
 * the target is not ahead, the events already present are exactly the shared prefix, so the write
 * starts at that index.
 *
 * With `force`, a diverged doc takes one extra step first: its divergent tail is backed up to the
 * transfer drive and deleted, which turns the doc back into a clean fast-forward. Re-planning inside
 * this story is what makes that safe - a doc that stopped being diverged since the review simply
 * fast-forwards and force never fires.
 */
export function* askEventDocBundleApplyDoc(doc: EventDocBundleDoc, options: EventDocBundleApplyOptions): AskResponse<EventDocTransferPlanRow> {
  const row = yield* askEventDocBundlePlanDoc(doc);

  if (isWritable(row.status)) {
    const eventsWritten = yield* askEventDocWriteForeignEvents(doc.id, doc.events, row.existingEvents, {
      importerUserId: options.importerUserId,
    });
    const assetsWritten = yield* askEventDocTransferWriteAssets(doc.id, doc.assets);

    return { ...row, eventsWritten, assetsWritten };
  }

  if (!options.force || !isForceable(row.status)) {
    return row;
  }

  const existingEvents = yield* askEventDocEventListAll(doc.id);
  const fromIndex = overwriteFromIndex(existingEvents, doc.events);

  const discarded = yield* askEventDocTransferTruncateLog(options.transferId, doc.id, existingEvents, fromIndex);
  const eventsWritten = yield* askEventDocWriteForeignEvents(doc.id, doc.events, fromIndex, {
    importerUserId: options.importerUserId,
    logRewritten: discarded.length > 0,
  });
  const assetsWritten = yield* askEventDocTransferWriteAssets(doc.id, doc.assets);

  return {
    ...row,
    status: EventDocTransferStatus.Overwritten,
    existingEvents: existingEvents.length,
    eventsWritten,
    assetsWritten,
    discardedEvents: discarded.length,
  };
}
