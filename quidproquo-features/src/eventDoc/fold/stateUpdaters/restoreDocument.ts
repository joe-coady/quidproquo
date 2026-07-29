import { EventDocDocument, EventDocEventPayload } from '../../models';

// RESTORE clears the soft delete. The DELETE event stays in the log — history is
// append-only — so this is a later fact that supersedes it, not an erasure.
export const restoreDocument = <TState extends EventDocDocument>(state: TState, _payload: EventDocEventPayload): TState => ({
  ...state,
  deletedAt: undefined,
  deletedBy: undefined,
});
