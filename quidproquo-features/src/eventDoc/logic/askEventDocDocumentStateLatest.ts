import { AskResponse, Nullable } from 'quidproquo-core';

import { askEventDocEventLast } from '../data/askEventDocEventLast';
import { EventDocDocumentStateAtEvent } from '../models';
import { askEventDocDocumentStateAsOf, EventDocDocumentStateAsOfOptions } from './askEventDocDocumentStateAsOf';

// The document view NOW: state as of the log's head event, latest-shaped, snapshot-seeded
// (see askEventDocDocumentStateAsOf). Null for a document with no events.
export function* askEventDocDocumentStateLatest(
  modelId: string,
  options?: EventDocDocumentStateAsOfOptions,
): AskResponse<Nullable<EventDocDocumentStateAtEvent>> {
  const head = yield* askEventDocEventLast(modelId);

  if (!head) {
    return null;
  }

  return yield* askEventDocDocumentStateAsOf(modelId, head.payload.metadata.eventId, options);
}
