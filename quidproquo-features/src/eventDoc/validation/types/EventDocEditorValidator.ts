import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';

// What an app implements once and shares both sides: given the incoming event and the
// document's FOLDED live state (history + pending, migrated to latest — a document slot
// receives its EventDocDocument state), run the validator registry and return the
// rejection reason or null. State, never the raw log: a bootstrap-loaded editor holds
// only the events after its snapshot base, and the folded state already carries
// everything the rules read (status, deletedAt, id, domain fields) — so validating
// state is what keeps the verdicts identical to a full-log fold. `unknown` at this
// altitude because local slots may validate too; createEventDocEventValidator owns the
// document narrowing.
export type EventDocEditorValidator = (event: EventDocEvent, state: unknown) => Nullable<string>;
