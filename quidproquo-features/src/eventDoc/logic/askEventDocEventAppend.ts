import { askDateNow, askInlineFunctionExecute, askNewSortableGuid, AskResponse } from 'quidproquo-core';

import { askEventDocStoreRead } from '../context/askEventDocStoreRead';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocEventWrite } from '../data/askEventDocEventWrite';
import { EventDocEffect, EventDocEvent, EventDocEventActor, EventDocEventInput, EventDocOnAppendInput, EventDocOnPublishInput } from '../models';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';
import { askEventDocSummaryRederive } from './askEventDocSummaryRederive';

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
 * before it in index order. It can never change, so folds stay reproducible no matter how
 * many appends land afterwards.
 */
export function* askEventDocEventAppend(modelId: string, input: EventDocEventInput, actor: EventDocEventActor): AskResponse<EventDocEvent> {
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

  // The id is unique by construction, so this cannot collide. ifNotExists stays as a cheap
  // assertion — if it ever fires, two writers minted the same id, which is a bug worth
  // surfacing loudly rather than a race to retry.
  yield* askEventDocEventWrite(modelId, event);

  // Keep the projection in step. This is the last thing the writer does for a read model and
  // it goes away entirely once the stream projector lands: the summary is derived from the
  // log, so nothing about it belongs on the write path.
  yield* askEventDocSummaryRederive(modelId);

  // Hooks run after the event is durably written. A hook may itself throw; that
  // propagates so the caller knows the side effect failed, not the append.
  const { onPublish, onAppend } = yield* askEventDocStoreRead();
  const firePublishHook = !!onPublish && event.type === EventDocEffect.Publish;

  if (firePublishHook || onAppend) {
    // Only read on the hook path. A collection with no hooks (every high-volume one)
    // never pays for these.
    const summary = yield* askEventDocGetByIdOrThrow(modelId);
    const events = yield* askEventDocEventListAll(modelId);

    if (firePublishHook) {
      yield* askInlineFunctionExecute<void, EventDocOnPublishInput>(onPublish!, {
        docId: modelId,
        event,
        summary,
        events,
      });
    }

    // The every-append hook runs after the publish hook so a broadcast of the
    // fresh fold always observes whatever read model onPublish just synced.
    if (onAppend) {
      yield* askInlineFunctionExecute<void, EventDocOnAppendInput>(onAppend, {
        docId: modelId,
        event,
        summary,
        events,
      });
    }
  }

  return event;
}
