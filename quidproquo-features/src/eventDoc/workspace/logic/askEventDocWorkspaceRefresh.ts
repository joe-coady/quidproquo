import { askCatch, askMapParallel, AskResponse } from 'quidproquo-core';

import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { askUIEventDocWorkspaceSetHistoryEvents } from '../actionCreators/askUIEventDocWorkspaceSetHistoryEvents';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceReadState } from './askEventDocWorkspaceReadState';

// Pull only the events appended since the last one we hold (afterIndex is exclusive,
// so the concat can't duplicate) and append them. Touches the SAVED log only; the
// pending buffer stays intact and the folded view re-derives reactively. A slot with
// no identity (local, or not yet initialised) is skipped.
const getAskRefreshDocumentSlot = (transport: EventDocWorkspaceTransport) =>
  function* askRefreshDocumentSlot(slotKey: string): AskResponse<void> {
    const state = yield* askEventDocWorkspaceReadState();
    const documentIdentity = state.slots[slotKey]?.documentIdentity;

    if (!documentIdentity) {
      return;
    }

    const history = state.history[slotKey] ?? [];
    const lastEvent = history[history.length - 1];

    yield* askUIEventDocWorkspaceSetError(slotKey, null);

    const result = yield* askCatch(transport.askFetchEvents(documentIdentity, lastEvent?.payload.metadata.index));

    if (!result.success) {
      yield* askUIEventDocWorkspaceSetError(slotKey, 'Failed to refresh.');
      return;
    }

    if (result.result.length > 0) {
      yield* askUIEventDocWorkspaceSetHistoryEvents(slotKey, [...history, ...result.result]);
    }
  };

export function* askEventDocWorkspaceRefresh(transport: EventDocWorkspaceTransport, slotKeys: string[]): AskResponse<void> {
  yield* askMapParallel(slotKeys, getAskRefreshDocumentSlot(transport));
}
