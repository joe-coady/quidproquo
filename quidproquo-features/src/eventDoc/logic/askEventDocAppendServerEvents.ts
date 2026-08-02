import { askDateNow, askNewSortableGuids, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askEventDocStoreRead } from '../context/askEventDocStoreRead';
import { askEventDocEventWriteMany } from '../data/askEventDocEventWriteMany';
import { EventDocEffect, EventDocEvent, EventDocEventActor, EventDocServerEventInput } from '../models';

/**
 * Append a burst of SERVER-AUTHORED events to a model's log in THREE actions —
 * one clock read, one batch id mint, one batch write — where a loop of
 * askEventDocAppendServerEvent pays five per event. The batch sibling of that
 * single server append, for the fan-out writers its WRITE-AND-GO contract
 * exists for (a flow run's sink streams hundreds of events per run).
 *
 * Same log out the other end: N ordinary events, each with its own sortable id
 * (askNewSortableGuids' array order IS sort order, so input order is log order),
 * so folds, snapshots, cursors and the stream projector cannot tell a batched
 * burst from a loop of singles.
 *
 * What batching deliberately drops:
 * - NO pre-write gate and NO hooks — server code is trusted (the fold is the
 *   gate), and hook stores are guarded below, not by caller discipline.
 * - A SHARED createdAt: every event in the batch carries the same write instant.
 *   Honest, because metadata.createdAt records the flush, never the occurrence —
 *   an event whose occurrence time matters carries it in its own data.
 * - clientMessageId reuses the event's own sortable id. For server appends the
 *   field is pure dedup uniqueness; a fresh guid per event would double the mints
 *   for no extra information.
 */
export function* askEventDocAppendServerEvents(
  modelId: string,
  inputs: EventDocServerEventInput[],
  actor: EventDocEventActor,
): AskResponse<EventDocEvent[]> {
  if (inputs.length === 0) {
    return [];
  }

  // THE GUARD for the no-hooks contract — enforced here, not by caller
  // discipline. A store that later gains onAppend/onPublish must fail loudly
  // the moment a batch tries to bypass its hooks (a silently-skipped hook is a
  // read model that quietly stops syncing); likewise a Publish inside a batch
  // would skip the publish hook. Both are zero-I/O checks (the store context is
  // a local read).
  const { onAppend, onPublish } = yield* askEventDocStoreRead();
  if (onAppend || onPublish) {
    return yield* askThrowError(
      ErrorTypeEnum.Invalid,
      `askEventDocAppendServerEvents cannot batch onto a store with onAppend/onPublish hooks - use per-event appends`,
    );
  }
  if (inputs.some((input) => input.type === EventDocEffect.Publish)) {
    return yield* askThrowError(ErrorTypeEnum.Invalid, `askEventDocAppendServerEvents cannot batch a Publish event - use per-event appends`);
  }

  const now = yield* askDateNow();
  const eventIds = yield* askNewSortableGuids(inputs.length);

  const events: EventDocEvent[] = inputs.map((input, index) => ({
    type: input.type,
    payload: {
      data: input.data,
      metadata: {
        version: input.version,
        clientMessageId: eventIds[index],
        createdBy: actor,
        createdAt: now,
        eventId: eventIds[index],
      },
    },
  }));

  yield* askEventDocEventWriteMany(modelId, events);

  return events;
}
