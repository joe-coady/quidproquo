import { AskResponse } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';

// The verbs every workspace exposes under api.workspace. slotKey omitted = every
// document slot.
export type EventDocWorkspaceBuiltInApi = {
  askInit: (identities: Record<string, EventDocWorkspaceDocumentIdentity>) => AskResponse<void>;
  askSave: (slotKey?: string) => AskResponse<void>;
  askCancel: (slotKey?: string) => AskResponse<void>;
  askRefresh: (slotKey?: string) => AskResponse<void>;
};
