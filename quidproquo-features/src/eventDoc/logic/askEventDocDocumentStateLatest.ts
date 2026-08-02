import { AskResponse, Nullable } from 'quidproquo-core';

import { askEventDocEventLast } from '../data/askEventDocEventLast';
import { EventDocDocumentStateAtEvent } from '../models';
import { askEventDocDocumentStateAsOf, EventDocDocumentStateAsOfOptions } from './askEventDocDocumentStateAsOf';

// The document view NOW: state as of the log's head event, latest-shaped, snapshot-seeded
// (see askEventDocDocumentStateAsOf). Null for a document with no events.
//
// consistentRead applies to the HEAD resolve as well as the gap read — a stale
// replica answering the head query silently truncates the log to an old event
// (or to nothing), and the gap read's own consistency cannot repair a stale
// clamp. Observed as a real failure: a fanned-out batch's sub-flow read back
// 'running, 33 steps, no terminal' microseconds after its terminal was written.
export function* askEventDocDocumentStateLatest(
  modelId: string,
  options?: EventDocDocumentStateAsOfOptions,
): AskResponse<Nullable<EventDocDocumentStateAtEvent>> {
  const head = yield* askEventDocEventLast(modelId, { consistentRead: options?.consistentRead });

  if (!head) {
    return null;
  }

  return yield* askEventDocDocumentStateAsOf(modelId, head.payload.metadata.eventId, options);
}
