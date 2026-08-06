import { createActionRequester, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from '../../workspace/types/EventDocWorkspaceDocumentIdentity';
import { EventDocActionType } from './EventDocActionType';

// Pure: only yields the declarative ReadIdentity action — the enclosing slot binding
// answers with the doc's address (serviceName/basePath/id). Null until the workspace
// initialises the slot (verbs guard on it), always null for unsaved docs. Same
// contract as askEventDocReadState: fail loudly outside a binding.
export const askEventDocReadIdentity = createActionRequester<Nullable<EventDocWorkspaceDocumentIdentity>>()({
  actionType: EventDocActionType.ReadIdentity,
});
