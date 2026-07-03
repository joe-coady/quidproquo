import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEditorValidator } from './types/EventDocEditorValidator';
import { EventDocEventValidators } from './types/EventDocEventValidators';
import { reservedEventDocEventValidators } from './reservedEventDocEventValidators';
import { validateEventDocEvent } from './validateEventDocEvent';

// Builds a collection's `EventDocEditorValidator` from its fold + its DOMAIN rules only, so no
// call site hand-writes `...reservedEventDocEventValidators`. The universal lifecycle guard (a
// published doc rejects everything but CREATE_DRAFT) is spread in HERE, and the domain entries are
// spread AFTER it — so a collection can both ADD rules (new event types) and OVERRIDE a reserved
// rule (e.g. client-access allows AddSecret/RevokeSecret on a published client). That override is
// exactly why the guard must be composed into one registry rather than run as a separate always-on
// default: a separate default can't be relaxed. The same validator runs on the frontend pending
// buffer and the backend append handler.
export const createEventDocEventValidator =
  <S extends EventDocDocument>(
    fold: (events: EventDocEvent[]) => S,
    domainValidators: EventDocEventValidators<S> = {}
  ): EventDocEditorValidator =>
  (event, events) =>
    validateEventDocEvent(
      { ...reservedEventDocEventValidators, ...domainValidators },
      event,
      fold(events)
    );
