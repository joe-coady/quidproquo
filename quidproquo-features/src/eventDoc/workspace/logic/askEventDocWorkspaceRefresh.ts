import { askCatch, askMapParallel, AskResponse } from 'quidproquo-core';

import { askUIEventDocWorkspaceAppendHistoryEvents } from '../actionCreators/askUIEventDocWorkspaceAppendHistoryEvents';
import { askUIEventDocWorkspaceClearError } from '../actionCreators/askUIEventDocWorkspaceClearError';
import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { EventDocWorkspaceSlotOperation } from '../types/EventDocWorkspaceSlotOperation';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';

// Pull only the events appended since the last one we hold (afterIndex is exclusive,
// so the append can't duplicate) and append JUST the tail, so the reducer folds only
// those events into the stored history view. Touches the SAVED log only; the pending
// buffer stays intact and the folded view re-derives reactively. A slot with no
// identity (local, or not yet initialised) is skipped.
const getAskRefreshDocumentSlot = (transport: EventDocWorkspaceTransport) =>
  function* askRefreshDocumentSlot(slotKey: string): AskResponse<void> {
    const state = yield* askEventDocWorkspaceReadState();
    const documentIdentity = state.slots[slotKey]?.documentIdentity;

    if (!documentIdentity) {
      return;
    }

    const history = state.history[slotKey] ?? [];
    const lastEvent = history[history.length - 1];

    yield* askUIEventDocWorkspaceClearError(slotKey);

    const result = yield* askCatch(transport.askFetchEvents(documentIdentity, lastEvent?.payload.metadata.index));

    if (!result.success) {
      yield* askUIEventDocWorkspaceSetError(slotKey, { operation: EventDocWorkspaceSlotOperation.load, error: result.error });
      return;
    }

    if (result.result.length > 0) {
      yield* askUIEventDocWorkspaceAppendHistoryEvents(slotKey, result.result);
    }
  };

export function* askEventDocWorkspaceRefresh(transport: EventDocWorkspaceTransport, slotKeys: string[]): AskResponse<void> {
  yield* askMapParallel(slotKeys, getAskRefreshDocumentSlot(transport));
}
