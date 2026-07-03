import { EventDocDocument } from '../../models';
import { EventDocEventValidator } from './EventDocEventValidator';

// A registry of validators keyed by event type, with a '*' fallback applied to any type
// without its own entry. Mirrors the fold reducer's effect-keyed handler map: apps spread
// the reserved registry and override entries to stack domain/payload rules.
export type EventDocEventValidators<
  S extends EventDocDocument = EventDocDocument,
> = Record<string, EventDocEventValidator<S>>;
