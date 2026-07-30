import { EventDocValueRef } from '../models';
import { isInlineEventDocValueRef } from './isInlineEventDocValueRef';

/**
 * Split a keyed record of value refs into the values already in hand and the refs that still need fetching.
 *
 * The shape every reader wants: inline values resolve for free, and only what is genuinely on the blob drive
 * costs a round trip. Before the inline union existed, a caller had no choice but to treat all of them as
 * remote, which is what turned one Test Centre grid render into 1,600-plus requests for a few kilobytes.
 *
 * Pure, so it can run in a reducer, a selector or a story without ceremony.
 */
export const readInlineEventDocValueRefs = (
  refs: Record<string, EventDocValueRef>,
): {
  resolved: Record<string, unknown>;
  remote: Record<string, Extract<EventDocValueRef, { kind: 'asset' }>>;
} => {
  const resolved: Record<string, unknown> = {};
  const remote: Record<string, Extract<EventDocValueRef, { kind: 'asset' }>> = {};

  for (const [key, ref] of Object.entries(refs)) {
    if (isInlineEventDocValueRef(ref)) {
      resolved[key] = ref.value;
    } else {
      remote[key] = ref;
    }
  }

  return { resolved, remote };
};
