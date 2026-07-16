import { replayEffects } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';

// Fold the pending tail onto an already-folded view. Pending events are authored at
// the slot's latest schema version, so no migration pass is needed; document slots
// still stamp updatedAt per event to match foldEventDocLog's behavior.
export const foldSlotPendingTail = (slot: EventDocWorkspaceSlotConfig, view: unknown, pending: EventDocEvent[]): unknown => {
  if (slot.kind !== EventDocWorkspaceSlotKind.document) {
    return replayEffects(view, slot.foldReducer, pending);
  }

  let next = view;
  for (const event of pending) {
    [next] = slot.foldReducer(next, event);
    next = { ...(next as object), updatedAt: event.payload.metadata.createdAt };
  }

  return next;
};
