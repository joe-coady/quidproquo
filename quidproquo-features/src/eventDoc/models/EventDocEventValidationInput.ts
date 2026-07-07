import { EventDocEvent } from './EventDocEvent';

// The payload a event-doc collection's `eventValidator` inline function receives:
// the incoming (stamped) event plus the full prior log, so the validator can fold the
// document state with its own reducer and decide whether the event may be appended.
export type EventDocEventValidationInput = {
  event: EventDocEvent;
  events: EventDocEvent[];
};
