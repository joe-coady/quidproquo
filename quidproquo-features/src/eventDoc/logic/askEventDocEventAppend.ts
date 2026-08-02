import { askDateNow, askInlineFunctionExecute, askNewSortableGuid, AskResponse } from 'quidproquo-core';

import { askEventDocStoreRead } from '../context/askEventDocStoreRead';
import { askEventDocEventWrite } from '../data/askEventDocEventWrite';
import { EventDocEffect, EventDocEvent, EventDocEventActor, EventDocEventInput, EventDocOnAppendInput, EventDocOnPublishInput } from '../models';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';
import { askEventDocHookStates } from './askEventDocHookStates';
import { askEventDocValidateAppend } from './askEventDocValidateAppend';

/**
 * Append a client event to a model's log.
 *
 * WRITE-AND-GO, in a single write. The event's index is a SORTABLE ID (UUIDv7, via
 * askNewSortableGuid): its string form sorts in creation order, so a writer can mint its own
 * position with no allocator, no counter and no coordination of any kind. The append does not
 * read the tail, does not read the log, does not validate, and has no retry loop, so
 * concurrent writers on the same document neither contend nor fail on each other. That is
 * what makes wide fan-out (hundreds of simultaneous appends to one doc) viable.
 *
 * Two appends in the same millisecond get an arbitrary but STABLE relative order. Stable is
 * what matters: a verdict below depends on stored order, and stored order never changes.
 *
 * VALIDATION MOVED TO THE FOLD. Because nothing is checked here, an event's right to
 * exist is decided when the log is folded (foldEventDocLog): the collection's validator
 * registry rejects it on domain/lifecycle rules, and the fold's acceptance bookkeeping
 * rejects a duplicate clientMessageId or a stale schema version. A rejected event is
 * ignored silently and the document reads as though it was never written.
 *
 * That silence is deliberate and load-bearing: clients validate before they send (the same
 * registry runs on the editor's pending buffer), so a rejected event means a client
 * skipped its own pre-flight, not that a user needs an error. The caller learns the
 * outcome the same way it learns everything else — by folding the log it gets back.
 *
 * The verdict for an event is a pure function of that event and the ACCEPTED events
 * before it in id order. It can never change, so folds stay reproducible no matter how many
 * appends land afterwards.
 *
 * NOTHING here maintains a read model. The summary is rebuilt from the log by the event
 * store's stream projector (see defineEventDocSummary's `onStream`), so it is eventually
 * consistent and entirely disposable — which is the whole point: a projection that the
 * writer maintains is not a projection, it is a second source of truth.
 */
export type EventDocEventAppendOptions = {
  // Run the registered pre-write gate (askEventDocValidateAppend) before the write.
  // TRUE for the append route — the trust boundary, where client-authored events must
  // be stopped before they enter the log. FALSE for server-authored appends
  // (askEventDocAppendServerEvent): server code is trusted to author valid events, the
  // fold remains their gate, and the walker's fan-out depends on appends staying
  // WRITE-AND-GO — a per-append state resolve turned an 800-event run into thousands
  // of reads.
  validate: boolean;
};

export function* askEventDocEventAppend(
  modelId: string,
  input: EventDocEventInput,
  actor: EventDocEventActor,
  options: EventDocEventAppendOptions = { validate: true },
): AskResponse<EventDocEvent> {
  const { metadata } = input.payload;

  const now = yield* askDateNow();
  const index = yield* askNewSortableGuid();

  const event: EventDocEvent = {
    type: input.type,
    payload: {
      data: input.payload.data,
      metadata: {
        version: metadata.version,
        clientMessageId: metadata.clientMessageId,
        createdBy: actor,
        createdAt: now,
        eventId: index,
      },
    },
  };

  // THE PRE-WRITE GATE, for collections with a registered definition: resolve the
  // document's current state (snapshot-seeded — cost tracks the gap, never the log) and
  // run the registered validateEvent BEFORE the write. Some rules must stop the write
  // itself, not just the fold: an append-only log holds a rejected-but-written secret
  // forever. Client-boundary appends only (see EventDocEventAppendOptions); a collection
  // with no registered functions object also skips (functions missing), keeping the
  // original write-and-go contract. The fold's acceptance rules remain the last word
  // either way (dedup + version floor are NOT validator rules and still resolve at fold
  // time).
  if (options.validate) {
    yield* askEventDocValidateAppend(modelId, event);
  }

  // The id is unique by construction, so this cannot collide. ifNotExists stays as a cheap
  // assertion — if it ever fires, two writers minted the same id, which is a bug worth
  // surfacing loudly rather than a race to retry.
  yield* askEventDocEventWrite(modelId, event);

  // Hooks run after the event is durably written. A hook may itself throw; that
  // propagates so the caller knows the side effect failed, not the append.
  const { onPublish, onAppend } = yield* askEventDocStoreRead();
  const firePublishHook = !!onPublish && event.type === EventDocEffect.Publish;

  if (firePublishHook || onAppend) {
    // Only read on the hook path. A collection with no hooks (every high-volume one)
    // never pays for these. The states are snapshot-seeded (gap since the nearest
    // snapshot, never the log), so hook cost tracks the burst.
    const summary = yield* askEventDocGetByIdOrThrow(modelId);
    const { state, previousState } = yield* askEventDocHookStates(modelId, event);

    if (firePublishHook) {
      yield* askInlineFunctionExecute<void, EventDocOnPublishInput>(onPublish!, {
        docId: modelId,
        event,
        summary,
        state,
        previousState,
      });
    }

    // The every-append hook runs after the publish hook so a broadcast of the
    // fresh fold always observes whatever read model onPublish just synced.
    if (onAppend) {
      yield* askInlineFunctionExecute<void, EventDocOnAppendInput>(onAppend, {
        docId: modelId,
        event,
        summary,
        state,
        previousState,
      });
    }
  }

  return event;
}
