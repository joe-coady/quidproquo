import { Action, ActionProcessor, ActionRequester, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from '../../workspace/types/EventDocWorkspaceDocumentIdentity';
import { EventDocActionType } from './EventDocActionType';

// No payload: WHICH doc is the processor's ambient context (the enclosing slot
// binding), same as ReadState.
export interface EventDocReadIdentityAction extends Action<void> {
  type: EventDocActionType.ReadIdentity;
}

// Concretely typed — every doc's identity has the same shape, so no per-doc minting.
// Null until the workspace initialises the slot; always null for unsaved docs.
export type EventDocReadIdentityActionProcessor = ActionProcessor<EventDocReadIdentityAction, Nullable<EventDocWorkspaceDocumentIdentity>>;
export type EventDocReadIdentityActionRequester = ActionRequester<EventDocReadIdentityAction, Nullable<EventDocWorkspaceDocumentIdentity>>;
