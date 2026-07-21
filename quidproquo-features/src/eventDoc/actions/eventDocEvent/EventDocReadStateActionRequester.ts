import { EventDocActionType } from './EventDocActionType';
import { EventDocReadStateActionRequester } from './EventDocReadStateActionRequesterTypes';

// Pure: only yields the declarative ReadState action — the enclosing slot binding
// answers with the doc's current folded state (the read counterpart of
// askApplyEventDocEvent). Contract for ANY answering processor:
// - read-your-own-writes: a commit earlier in the same story is visible to this read
//   (the workspace override folds the pending tail, so this holds for free there);
// - fail loudly outside a binding: no default processor ships, so an unbound read is
//   a runtime error, never a silent default.
// Call through a per-doc createEventDocStateReader for a typed result.
export function* askEventDocReadState(): EventDocReadStateActionRequester {
  return yield {
    type: EventDocActionType.ReadState,
  };
}
