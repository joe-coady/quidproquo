import { AskResponse } from 'quidproquo-core';

import { EventDocEffect, EventDocEventActor, EventDocSummary } from '../models';
import { askEventDocAppendServerEvent } from './askEventDocAppendServerEvent';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';

/**
 * Soft-delete by appending a DELETE event.
 *
 * It used to write `deletedAt` straight onto the record, which made the record hold state
 * nothing could reproduce: rebuilding that projection from the log would have brought the
 * document back. As an event, the deletion is history, and every projection derives it
 * (`askEventDocList` still hides deleted rows by default).
 *
 * Versions and blob claims are untouched, so `askEventDocRestore` puts the document back
 * exactly as it was. The validator rejects deleting an already-deleted document.
 *
 * `schemaVersion` is the caller's, exactly like any other event: the fold rejects an event
 * authored against an older schema than the log has reached, and a delete is no more exempt
 * from that than an edit. INIT_STATE is the only event that gets to pin its own version,
 * because it is the one that opens the log.
 */
export function* askEventDocSoftDelete(id: string, updatedBy: string, schemaVersion: number): AskResponse<EventDocSummary> {
  const actor: EventDocEventActor = { userId: updatedBy, userDisplayName: updatedBy };

  yield* askEventDocAppendServerEvent(id, EventDocEffect.Delete, undefined, schemaVersion, actor);

  return yield* askEventDocGetByIdOrThrow(id);
}
