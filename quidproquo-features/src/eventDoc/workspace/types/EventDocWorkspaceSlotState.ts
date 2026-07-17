import { Nullable } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceSlotError } from './EventDocWorkspaceSlotError';

// Per-slot runtime status. `documentIdentity` is null for local slots and for document
// slots that have not been initialised yet.
export type EventDocWorkspaceSlotState = {
  documentIdentity: Nullable<EventDocWorkspaceDocumentIdentity>;
  isLoading: boolean;
  isSaving: boolean;
  error: Nullable<EventDocWorkspaceSlotError>;
};

export const createInitialEventDocWorkspaceSlotState = (): EventDocWorkspaceSlotState => ({
  documentIdentity: null,
  isLoading: false,
  isSaving: false,
  error: null,
});
