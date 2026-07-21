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
import { EventDocWorkspaceSlotSnapshot, EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceRefresh } from './askEventDocWorkspaceRefresh';
import { isSameEventDocWorkspaceIdentity } from './isSameEventDocWorkspaceIdentity';

// Instant restore from a runtime hand-off (federated module hot-swap): seed history
// AND pending straight from the snapshot — the view renders immediately, exactly as
// it looked before the swap, with NO loading state — then tail-pull only the events
// that landed server-side since (the refresh path: afterIndex fetch, no isLoading).
// The restored history refolds through THIS runtime's reducer/migrations, so a
// schema-bump swap folds correctly.
const getAskInitDocumentSlotFromSnapshot = (transport: EventDocWorkspaceTransport) =>
  function* askInitDocumentSlotFromSnapshot(
    slotKey: string,
    documentIdentity: EventDocWorkspaceDocumentIdentity,
    history: EventDocEvent[],
    pending: EventDocEvent[],
  ): AskResponse<void> {
    yield* askUIEventDocWorkspaceSetDocumentIdentity(slotKey, documentIdentity);
    yield* askUIEventDocWorkspaceSetHistoryEvents(slotKey, history);
    yield* askUIEventDocWorkspaceSetPendingEvents(slotKey, renumberWorkspaceEvents(pending, history.length));
    yield* askUIEventDocWorkspaceClearError(slotKey);

    yield* askEventDocWorkspaceRefresh(transport, [slotKey]);
  };

// Seed identity, seed the buffer, and load the full saved log for ONE slot. The
// buffer is normally dropped (a stale buffer from a previous session must not leak
// into a fresh open), but a snapshot slot whose identity matches the incoming one
// restores its pending — that's a runtime hand-off (e.g. a federated module
// hot-swap), where pending is precious. It seeds BEFORE the fetch so a failed load
// never discards intent, and renumbers after the fetched history lands so
// provisional indexes continue the saved log.
const getAskInitDocumentSlot = (transport: EventDocWorkspaceTransport, snapshot: Nullable<EventDocWorkspaceSnapshot>) =>
  function* askInitDocumentSlot([slotKey, documentIdentity]: [string, EventDocWorkspaceDocumentIdentity]): AskResponse<void> {
    const snapshotSlot: EventDocWorkspaceSlotSnapshot | undefined = snapshot?.slots[slotKey];
    const snapshotMatches = !!snapshotSlot && isSameEventDocWorkspaceIdentity(snapshotSlot.documentIdentity, documentIdentity);

    // A matching snapshot WITH history takes the instant path. Without history (an
    // older bundle's snapshot, or a caller that stripped it to force a refetch)
    // only pending restores and the blocking full load below runs as always.
    if (snapshotMatches && snapshotSlot.history) {
      yield* getAskInitDocumentSlotFromSnapshot(transport)(slotKey, documentIdentity, snapshotSlot.history, snapshotSlot.pending);
      return;
    }

    const preservedPending: EventDocEvent[] = snapshotMatches ? snapshotSlot.pending : [];

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
