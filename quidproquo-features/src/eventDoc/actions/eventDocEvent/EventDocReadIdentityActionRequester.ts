import { EventDocActionType } from './EventDocActionType';
import { EventDocReadIdentityActionRequester } from './EventDocReadIdentityActionRequesterTypes';

// Pure: only yields the declarative ReadIdentity action — the enclosing slot binding
// answers with the doc's address (serviceName/basePath/id). Null until the workspace
// initialises the slot (verbs guard on it), always null for unsaved docs. Same
// contract as askEventDocReadState: fail loudly outside a binding.
export function* askEventDocReadIdentity(): EventDocReadIdentityActionRequester {
  return yield {
    type: EventDocActionType.ReadIdentity,
  };
}
