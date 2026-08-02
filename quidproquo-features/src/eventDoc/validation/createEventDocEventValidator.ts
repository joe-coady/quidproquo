import { EventDocDocument } from '../models';
import { EventDocEditorValidator } from './types/EventDocEditorValidator';
import { EventDocEventValidators } from './types/EventDocEventValidators';
import { reservedEventDocEventValidators } from './reservedEventDocEventValidators';
import { validateEventDocEvent } from './validateEventDocEvent';

// Builds a collection's `EventDocEditorValidator` from its DOMAIN rules only, so no call site
// hand-writes `...reservedEventDocEventValidators`. The universal lifecycle guard (a published
// doc rejects everything but CREATE_DRAFT) is spread in HERE, and the domain entries are spread
// AFTER it — so a collection can both ADD rules (new event types) and OVERRIDE a reserved rule
// (e.g. client-access allows AddSecret/RevokeSecret on a published client). That override is
// exactly why the guard must be composed into one registry rather than run as a separate
// always-on default: a separate default can't be relaxed. The caller supplies the folded state
// (there is no fold in here — the workspace passes its live view), so the same validator runs
// against a full log or a snapshot-seeded partial one.
export const createEventDocEventValidator =
  <S extends EventDocDocument>(domainValidators: EventDocEventValidators<S> = {}): EventDocEditorValidator =>
  (event, state) =>
    validateEventDocEvent({ ...reservedEventDocEventValidators, ...domainValidators }, event, state as S);
