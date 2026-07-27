import { EventDocEvent } from '../../eventDoc/models';
import { EventDocLogComparison } from '../models';

// An event's identity, and the whole basis of the comparison. Events are immutable and written
// verbatim, so if two logs agree on (type, index, version, clientMessageId, createdAt) at the
// same position they ARE the same event; there is no need to deep-compare payload data, which
// would mean depending on JSON key order surviving a round trip through two stores.
const eventIdentity = (event: EventDocEvent): string => {
  const { index, version, clientMessageId, createdAt } = event.payload.metadata;

  return [event.type, index, version, clientMessageId, createdAt].join('|');
};

/**
 * How `existing` relates to `incoming`. Import is fast-forward only, so the question is whether
 * existing is a prefix of incoming: if it is, everything past the shared prefix is what gets
 * written. `existingAhead` covers the "target has more events" case, which is NOT a divergence
 * (nothing disagrees) but is still not importable, because the bundle is behind the target.
 */
export const findEventDocLogDivergence = (existing: EventDocEvent[], incoming: EventDocEvent[]): EventDocLogComparison => {
  const sharedLength = Math.min(existing.length, incoming.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (eventIdentity(existing[index]) !== eventIdentity(incoming[index])) {
      return { diverged: true, atIndex: index };
    }
  }

  return {
    diverged: false,
    sharedCount: sharedLength,
    existingAhead: existing.length > incoming.length,
  };
};
