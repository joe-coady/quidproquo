import { askCatch, askMapParallel, AskResponse } from 'quidproquo-core';

import { askUIEventDocWorkspaceClearError } from '../actionCreators/askUIEventDocWorkspaceClearError';
import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { askUIEventDocWorkspaceSetFullHistory } from '../actionCreators/askUIEventDocWorkspaceSetFullHistory';
import { EventDocWorkspaceSlotOperation } from '../types/EventDocWorkspaceSlotOperation';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';

// Load a slot's COMPLETE saved log into the fullHistory side-channel — the history
// dialog's read, since the working history starts after the snapshot base. Fetched
// fresh on every call (the caller invokes it when the dialog opens), so a log that
// grew since the last look shows current. A slot with no identity (local, or not yet
// initialised) is skipped.
const getAskLoadSlotFullHistory = (transport: EventDocWorkspaceTransport) =>
  function* askLoadSlotFullHistory(slotKey: string): AskResponse<void> {
    const state = yield* askEventDocWorkspaceReadState();
    const documentIdentity = state.slots[slotKey]?.documentIdentity;

    if (!documentIdentity) {
      return;
    }

    yield* askUIEventDocWorkspaceClearError(slotKey);

    const result = yield* askCatch(transport.askFetchEvents(documentIdentity));

    if (!result.success) {
      yield* askUIEventDocWorkspaceSetError(slotKey, { operation: EventDocWorkspaceSlotOperation.load, error: result.error });
      return;
    }

    yield* askUIEventDocWorkspaceSetFullHistory(slotKey, result.result);
  };

export function* askEventDocWorkspaceLoadFullHistory(transport: EventDocWorkspaceTransport, slotKeys: string[]): AskResponse<void> {
  yield* askMapParallel(slotKeys, getAskLoadSlotFullHistory(transport));
}
