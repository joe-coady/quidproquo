import { Nullable } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../../models';

// A pure rule for ONE event type: given the incoming event and the document state folded
// from all prior events, return null if it may be applied or a reason it may not. Mirrors
// a fold reducer's per-effect handler. Composed into a registry, run identically on the
// frontend pending buffer and the backend append handler.
export type EventDocEventValidator<S extends EventDocDocument = EventDocDocument> = (event: EventDocEvent, state: S) => Nullable<string>;
