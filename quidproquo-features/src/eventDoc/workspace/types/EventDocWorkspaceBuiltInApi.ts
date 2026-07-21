import { AskResponse } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceSnapshot } from './EventDocWorkspaceSnapshot';

// The verbs every workspace exposes under api.workspace. slotKey omitted = every
// document slot. init's optional snapshot restores a prior runtime's pending buffer
// (identity-matched per slot) — the federated hot-swap hand-off.
export type EventDocWorkspaceBuiltInApi = {
  askInit: (identities: Record<string, EventDocWorkspaceDocumentIdentity>, snapshot?: EventDocWorkspaceSnapshot) => AskResponse<void>;
  askSave: (slotKey?: string) => AskResponse<void>;
  askCancel: (slotKey?: string) => AskResponse<void>;
  askRefresh: (slotKey?: string) => AskResponse<void>;
};
