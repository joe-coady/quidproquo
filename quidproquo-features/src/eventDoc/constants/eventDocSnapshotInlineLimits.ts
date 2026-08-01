/**
 * The largest a snapshot's folded state may be (serialised JSON bytes) and still be stored inline
 * on its snapshot row; anything bigger goes to the collection's blob drive and the row records only
 * that it is there (EventDocSnapshot's inline/storageDrive split).
 *
 * The bound this protects is DynamoDB's 400KB item ceiling, which is measured on the WHOLE marshalled
 * item — keys, collection type, attribute overhead — not just the state. 300KB leaves comfortable
 * headroom for all of that while still keeping the overwhelmingly common case (states of a few KB) on
 * the row, where a single query returns them with no second round trip.
 */
export const EVENT_DOC_SNAPSHOT_INLINE_MAX_BYTES = 300 * 1024;
