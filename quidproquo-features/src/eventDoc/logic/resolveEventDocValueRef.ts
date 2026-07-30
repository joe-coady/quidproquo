import { EventDocValueRef } from '../models';
import { isInlineEventDocValueRef } from './isInlineEventDocValueRef';

/**
 * Resolve one value ref against a cache of already-fetched asset snapshots (keyed by asset guid).
 *
 * The single rule every reader shares, so "is this value available yet" cannot be answered differently in
 * different places. An INLINE ref is always available — it travelled in the event, so there is nothing to
 * fetch and no way for it to be missing. An ASSET ref is available only once its snapshot has been fetched.
 *
 * `available` is separate from `value` because `null` is a legitimate recorded value: a node that returns
 * null is not the same as a payload that has not loaded, and collapsing the two makes a real output look
 * like a broken one.
 */
export const resolveEventDocValueRef = (ref: EventDocValueRef, snapshots: Record<string, unknown>): { value: unknown; available: boolean } => {
  if (isInlineEventDocValueRef(ref)) {
    return { value: ref.value, available: true };
  }

  return Object.prototype.hasOwnProperty.call(snapshots, ref.guid)
    ? { value: snapshots[ref.guid], available: true }
    : { value: null, available: false };
};
