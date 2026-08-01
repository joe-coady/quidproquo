import { QpqReducer } from 'quidproquo-core';

import { EventDocMigration } from '../../fold/EventDocMigration';
import { EventDocDocument, EventDocEvent } from '../../models';

// A view at any version ABOVE the base: it has a predecessor and no seed.
//
// `migrateFromPrevious` is REQUIRED even when this view's shape did not change at this
// version — pass `(state) => state`. The version index is shared by every view of a doc
// type, so bumping it for one view's benefit drags all the others along; an explicit
// no-op is evidence someone considered whether this view was affected, and a defaulted
// one is evidence of nothing. The typed no-op costs a line and buys the guarantee that
// no view ever silently stops matching its events.
export type EventDocNextViewVersion<TView extends EventDocDocument = EventDocDocument> = {
  foldReducer: QpqReducer<TView, EventDocEvent>;
  // Maps the PREVIOUS version's folded state onto this one's. The fold stamps
  // schemaVersion, so a migration only transforms data fields.
  migrateFromPrevious: EventDocMigration;
};
