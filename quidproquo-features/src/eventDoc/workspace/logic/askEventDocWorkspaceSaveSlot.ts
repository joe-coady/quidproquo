import { askCatch, AskResponse } from 'quidproquo-core';

import { askUIEventDocWorkspaceAppendHistoryEvent } from '../actionCreators/askUIEventDocWorkspaceAppendHistoryEvent';
import { askUIEventDocWorkspaceRemovePendingEvent } from '../actionCreators/askUIEventDocWorkspaceRemovePendingEvent';
import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { askUIEventDocWorkspaceSetSaving } from '../actionCreators/askUIEventDocWorkspaceSetSaving';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';
import { toEventDocEventInput } from './toEventDocEventInput';

// Stream ONE slot's pending events, each moving into the saved log as it lands.
// Per-event is deliberate: the document stays editable mid-save, and an interrupted
// save leaves only the unsaved tail pending (the backend dedups against the latest
// event only, so re-sending a non-latest event would duplicate). Re-entrancy guard
// per slot: skip if already saving.
export function* askEventDocWorkspaceSaveSlot(transport: EventDocWorkspaceTransport, slotKey: string): AskResponse<void> {
  const state = yield* askEventDocWorkspaceReadState();
  const slotState = state.slots[slotKey];
  const documentIdentity = slotState?.documentIdentity;
  const pendingEvents = state.pending[slotKey] ?? [];

  if (!slotState || slotState.isSaving || !documentIdentity || pendingEvents.length === 0) {
    return;
  }

  yield* askUIEventDocWorkspaceSetSaving(slotKey, true);
  yield* askUIEventDocWorkspaceSetError(slotKey, null);

  for (const pending of pendingEvents) {
    const result = yield* askCatch(transport.askAppendEvent(documentIdentity, toEventDocEventInput(pending)));

    if (!result.success) {
      yield* askUIEventDocWorkspaceSetError(slotKey, `Failed to save - ${result.error.errorText}`);
      break;
    }

    yield* askUIEventDocWorkspaceAppendHistoryEvent(slotKey, result.result);
    yield* askUIEventDocWorkspaceRemovePendingEvent(slotKey, result.result.payload.metadata.clientMessageId);
  }

  yield* askUIEventDocWorkspaceSetSaving(slotKey, false);
}
