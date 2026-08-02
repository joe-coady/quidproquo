import { Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocSnapshotBase } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';

// A serializable capture of everything worth carrying ACROSS a workspace runtime
// (e.g. hot-swapping a federated editor bundle): per document slot, which doc the
// slot was bound to, the unsaved pending buffer — pure client intent — and the held
// history, so the incoming runtime renders INSTANTLY from the snapshot and only
// tail-pulls what landed server-side since (no loading flash, no full refetch). Per
// LOCAL slot the session's pending stream (the editor's experience: active tab,
// chrome panels), so a swap doesn't reset the user's place. historyViews is a
// derived fold and transient events are never-saved observations — neither belongs
// here. Pending events keep their authored schema version; a snapshot restored into
// a newer module forms a legitimate mixed-version tail (see foldEventDocLiveView),
// and restored history refolds through the new module's migrations.
export type EventDocWorkspaceSlotSnapshot = {
  documentIdentity: EventDocWorkspaceDocumentIdentity;
  pending: EventDocEvent[];
  // Optional so a snapshot exported by an older bundle restores cleanly (it falls
  // back to the blocking full fetch); also the caller's knob — strip it to force a
  // full refetch on restore.
  history?: EventDocEvent[];
  // The fold base `history` follows from — MUST travel with it: a bootstrap-loaded
  // slot's history starts after its base, and restoring that history without the
  // base would refold a partial log from pristine. Absent (older bundle) or null
  // means the history is the whole log.
  base?: Nullable<EventDocSnapshotBase>;
};

export type EventDocWorkspaceSnapshot = {
  slots: Record<string, EventDocWorkspaceSlotSnapshot>;
  // Optional so a snapshot exported by an older bundle (pre local-slot capture)
  // restores cleanly into a newer one — the swap crosses build versions by design.
  localSlots?: Record<string, EventDocEvent[]>;
};
