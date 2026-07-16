import { askDateNow, askNewGuid, AskResponse, QpqIsoDateTime } from 'quidproquo-core';

import { EventDocApplyEventActionPayload } from '../../actions';
import { EventDocEvent } from '../../models';
import { askUIEventDocWorkspaceApplyEvent } from '../actionCreators/askUIEventDocWorkspaceApplyEvent';
import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { EventDocWorkspaceSlotBinding } from '../types/EventDocWorkspaceSlotBinding';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';

// The workspace interpretation of askApplyEventDocEvent: record ONE event into the
// bound slot's stream (pending for document slots, history for local slots). Local
// only, no network; Save streams the pending buffer later. Metadata is provisional:
// only `data` + `version` affect the fold, and the backend stamps
// createdBy/createdAt/index on save. The validator runs against the slot's full live
// log (saved + pending) BEFORE anything lands; a rejection surfaces as slot error
// state (never throws) and the event is dropped. Coalesce + renumber happen atomically
// in the reducer (see createApplyEventUpdater).
export function* askEventDocWorkspaceCommitEvent(
  binding: EventDocWorkspaceSlotBinding,
  { eventType, data }: EventDocApplyEventActionPayload,
): AskResponse<void> {
  const clientMessageId = yield* askNewGuid();
  const createdAt = (yield* askDateNow()) as QpqIsoDateTime;

  const event: EventDocEvent = {
    type: eventType,
    payload: {
      data,
      metadata: {
        // The slot authors at one schema version; every event it commits carries it.
        version: binding.schemaVersion,
        clientMessageId,
        createdBy: { userId: '', userDisplayName: '' },
        createdAt,
        index: 0, // assigned by the reducer's renumber
      },
    },
  };

  if (binding.validate) {
    const state = yield* askEventDocWorkspaceReadState();
    const liveEvents = [...(state.history[binding.slotKey] ?? []), ...(state.pending[binding.slotKey] ?? [])];

    const reason = binding.validate(event, liveEvents);
    if (reason) {
      yield* askUIEventDocWorkspaceSetError(binding.slotKey, reason);
      return;
    }
  }

  yield* askUIEventDocWorkspaceSetError(binding.slotKey, null);
  yield* askUIEventDocWorkspaceApplyEvent(binding.slotKey, binding.isPending, event);
}
