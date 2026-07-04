import { Nullable } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from './types/EventDocEventValidators';

// Wildcard key: the validator applied to any event type without its own registry entry.
const WILDCARD = '*';

// Run the registry entry for the event's type, falling back to the wildcard, returning
// the rejection reason or null. The single entry point both the frontend editor and the
// backend inline function call (after each has folded the document state its own way).
export const validateEventDocEvent = <S extends EventDocDocument>(
  validators: EventDocEventValidators<S>,
  event: EventDocEvent,
  state: S,
): Nullable<string> => (validators[event.type] ?? validators[WILDCARD])?.(event, state) ?? null;
