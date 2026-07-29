import { AskResponse } from 'quidproquo-core';

import { EventDocEffect, EventDocEventActor, EventDocSummary } from '../models';
import { askEventDocAppendServerEvent } from './askEventDocAppendServerEvent';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';

/**
 * Undo a soft delete by appending a RESTORE event.
 *
 * The DELETE stays in the log: history is append-only, so this is a later fact that
 * supersedes it rather than an erasure, and the document's deletion remains auditable. The
 * validator rejects restoring a document that is not deleted.
 *
 * `schemaVersion` is the caller's, for the same reason it is on askEventDocSoftDelete.
 */
export function* askEventDocRestore(id: string, updatedBy: string, schemaVersion: number): AskResponse<EventDocSummary> {
  const actor: EventDocEventActor = { userId: updatedBy, userDisplayName: updatedBy };

  yield* askEventDocAppendServerEvent(id, EventDocEffect.Restore, undefined, schemaVersion, actor);

  return yield* askEventDocGetByIdOrThrow(id);
}
