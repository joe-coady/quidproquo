import { EventDocEventValidator } from '../types/EventDocEventValidator';

// INIT_STATE opens a brand-new log; a document may only be initialised once.
//
// "Already initialised" is read off the document's own identity, because INIT_STATE is the
// event that sets it — an id that is already there means this has been done. The seed leaves
// it empty (createEventDocInitialDocumentState).
//
// State-aware rather than a flat refusal, because the rule runs in two places that mean
// different things by INIT. At APPEND time the document always exists, so every INIT is a
// re-initialisation and is refused. During a FOLD the first INIT is the log's legitimate
// opener and has to apply — a flat refusal dropped it and left every folded document holding
// the seed's placeholder identity.
export const forbidInit: EventDocEventValidator = (_event, state) => (state.id ? 'Cannot re-initialise an existing document.' : null);
