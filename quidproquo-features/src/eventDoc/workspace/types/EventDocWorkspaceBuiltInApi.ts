import { AskResponse } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceSnapshot } from './EventDocWorkspaceSnapshot';

// The verbs every workspace exposes under api.workspace. slotKey omitted = every
// document slot. init's optional snapshot restores a prior runtime's pending buffer
// (identity-matched per slot) — the federated hot-swap hand-off. askLoadHistory
// loads a slot's COMPLETE saved log into the fullHistory side-channel (the history
// dialog's read — the working history starts after the snapshot base).
export type EventDocWorkspaceBuiltInApi = {
  askInit: (identities: Record<string, EventDocWorkspaceDocumentIdentity>, snapshot?: EventDocWorkspaceSnapshot) => AskResponse<void>;
  askSave: (slotKey?: string) => AskResponse<void>;
  askCancel: (slotKey?: string) => AskResponse<void>;
  askRefresh: (slotKey?: string) => AskResponse<void>;
  askLoadHistory: (slotKey?: string) => AskResponse<void>;
};
