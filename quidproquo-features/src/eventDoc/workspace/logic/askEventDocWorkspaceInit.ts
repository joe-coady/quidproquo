import { askCatch, askMapParallel, AskResponse, Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { askUIEventDocWorkspaceClearError } from '../actionCreators/askUIEventDocWorkspaceClearError';
import { askUIEventDocWorkspaceSetDocumentIdentity } from '../actionCreators/askUIEventDocWorkspaceSetDocumentIdentity';
import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { askUIEventDocWorkspaceSetHistoryEvents } from '../actionCreators/askUIEventDocWorkspaceSetHistoryEvents';
import { askUIEventDocWorkspaceSetLoading } from '../actionCreators/askUIEventDocWorkspaceSetLoading';
import { askUIEventDocWorkspaceSetPendingEvents } from '../actionCreators/askUIEventDocWorkspaceSetPendingEvents';
import { renumberWorkspaceEvents } from '../reducer/renumberWorkspaceEvents';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceSlotOperation } from '../types/EventDocWorkspaceSlotOperation';
import { EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { isSameEventDocWorkspaceIdentity } from './isSameEventDocWorkspaceIdentity';

// Seed identity, seed the buffer, and load the full saved log for ONE slot. The
// buffer is normally dropped (a stale buffer from a previous session must not leak
// into a fresh open), but a snapshot slot whose identity matches the incoming one
// restores its pending — that's a runtime hand-off (e.g. a federated module
// hot-swap), where pending is the ONLY thing worth carrying. It seeds BEFORE the
// fetch so a failed load never discards intent, and renumbers after the fetched
// history lands so provisional indexes continue the saved log.
const getAskInitDocumentSlot = (transport: EventDocWorkspaceTransport, snapshot: Nullable<EventDocWorkspaceSnapshot>) =>
  function* askInitDocumentSlot([slotKey, documentIdentity]: [string, EventDocWorkspaceDocumentIdentity]): AskResponse<void> {
    const snapshotSlot = snapshot?.slots[slotKey];
    const preservedPending: EventDocEvent[] =
      snapshotSlot && isSameEventDocWorkspaceIdentity(snapshotSlot.documentIdentity, documentIdentity) ? snapshotSlot.pending : [];

    yield* askUIEventDocWorkspaceSetDocumentIdentity(slotKey, documentIdentity);
    yield* askUIEventDocWorkspaceSetPendingEvents(slotKey, preservedPending);
    yield* askUIEventDocWorkspaceClearError(slotKey);
    yield* askUIEventDocWorkspaceSetLoading(slotKey, true);

    const result = yield* askCatch(transport.askFetchEvents(documentIdentity));

    if (!result.success) {
      yield* askUIEventDocWorkspaceSetError(slotKey, { operation: EventDocWorkspaceSlotOperation.load, error: result.error });
      yield* askUIEventDocWorkspaceSetLoading(slotKey, false);
      return;
    }

    yield* askUIEventDocWorkspaceSetHistoryEvents(slotKey, result.result);

    if (preservedPending.length > 0) {
      yield* askUIEventDocWorkspaceSetPendingEvents(slotKey, renumberWorkspaceEvents(preservedPending, result.result.length));
    }

    yield* askUIEventDocWorkspaceSetLoading(slotKey, false);
  };

// Load every requested document slot in parallel: independent logs, independent
// loading/error state per slot.
export function* askEventDocWorkspaceInit(
  transport: EventDocWorkspaceTransport,
  identities: Record<string, EventDocWorkspaceDocumentIdentity>,
  snapshot: Nullable<EventDocWorkspaceSnapshot> = null,
): AskResponse<void> {
  yield* askMapParallel(Object.entries(identities), getAskInitDocumentSlot(transport, snapshot));
}
