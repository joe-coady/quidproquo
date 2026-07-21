import { AskResponse, Nullable } from 'quidproquo-core';

import { askUIEventDocWorkspaceSetPendingEvents } from '../actionCreators/askUIEventDocWorkspaceSetPendingEvents';
import { EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';

// Restore a snapshot's LOCAL slot streams (editor experience: active tab, chrome
// panels) into a fresh runtime. Locals have no identity to match and no transport to
// consult — the whole stream is session state, so it replaces pending wholesale.
// Unknown keys are dropped rather than growing phantom slots, and a snapshot from an
// older bundle without localSlots restores nothing.
export function* askEventDocWorkspaceRestoreLocalPending(snapshot: Nullable<EventDocWorkspaceSnapshot>, localSlotKeys: string[]): AskResponse<void> {
  for (const [slotKey, pending] of Object.entries(snapshot?.localSlots ?? {})) {
    if (localSlotKeys.includes(slotKey) && pending.length > 0) {
      yield* askUIEventDocWorkspaceSetPendingEvents(slotKey, pending);
    }
  }
}
