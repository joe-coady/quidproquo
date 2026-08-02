import { askCatch, AskResponse, askThrowError, createDynamicFunctionCaller } from 'quidproquo-core';

import { eventDocFunctionsName } from '../constants/eventDocFunctionsName';
import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocSnapshotBaseLatest } from '../data/askEventDocSnapshotBaseLatest';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { foldEventDocBase } from '../fold/foldEventDocBase';
import { EventDocEvent } from '../models';
import { isEventDocFunctionsMissing } from './isEventDocFunctionsMissing';

export type EventDocHookStates = {
  // The document as of the triggering event, latest-shaped.
  state: unknown;
  // The document as of the event BEFORE it — what a hook diffs against to see what the
  // event changed (the maintenance hook's transition detection). Pristine initial state
  // for the log's first event.
  previousState: unknown;
};

/**
 * The state pair a hook receives: the document as of the just-appended event, and as of
 * its predecessor — derived from ONE snapshot-seeded gap read, so hook cost tracks the
 * burst since the last snapshot, never the log. Event reads are CONSISTENT: the
 * triggering event was written moments ago and the fold must include it.
 *
 * A collection with no registered definition still gets hooks: the fallback folds the
 * RESERVED base view from the whole prefix (identity/lifecycle only — all that is
 * derivable without the collection's reducers).
 */
export function* askEventDocHookStates(modelId: string, event: EventDocEvent): AskResponse<EventDocHookStates> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(eventDocFunctionsName(storeName, type));

  const eventId = event.payload.metadata.eventId;
  const base = yield* askEventDocSnapshotBaseLatest(modelId, eventId);

  // The gap ends AT the triggering event (upToEventId inclusive), so its last element is
  // the event itself and the predecessor state is the same gap minus that tail. A base
  // already at the event (a projector that raced ahead, a replayed import) leaves no gap
  // to subtract from — refold the whole prefix instead; rare by construction.
  const gap =
    base && base.eventId !== eventId
      ? yield* askEventDocEventListAll(modelId, { afterEventId: base.eventId, upToEventId: eventId, consistentRead: true })
      : null;

  const seededGap = gap && gap.length > 0 ? gap : null;

  const events = seededGap ?? (yield* askEventDocEventListAll(modelId, { upToEventId: eventId, consistentRead: true }));
  const seedState = seededGap ? base?.state : undefined;

  const folded = yield* askCatch(functionsCaller.foldDocumentState(events, seedState));

  if (!folded.success) {
    if (!isEventDocFunctionsMissing(folded.error.errorType)) {
      return yield* askThrowError(folded.error.errorType, folded.error.errorText);
    }

    // No definition registered: the reserved base fold is all that exists. Whole-prefix
    // read — acceptable for the rare definition-less collection that configures hooks.
    const prefix = seededGap ? yield* askEventDocEventListAll(modelId, { upToEventId: eventId, consistentRead: true }) : events;

    return {
      state: foldEventDocBase(prefix),
      previousState: foldEventDocBase(prefix.slice(0, -1)),
    };
  }

  const previousState = yield* functionsCaller.foldDocumentState(events.slice(0, -1), seedState);

  return { state: folded.result, previousState };
}
