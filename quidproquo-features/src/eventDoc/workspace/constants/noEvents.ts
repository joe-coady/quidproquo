import { EventDocEvent } from '../../models';

// Stable empty array so a slot with no events yet doesn't defeat reference-equality
// memoization in the selectors.
export const noEvents: EventDocEvent[] = [];
