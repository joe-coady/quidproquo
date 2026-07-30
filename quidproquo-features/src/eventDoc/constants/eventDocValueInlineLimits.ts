/**
 * The largest a single value may be (serialised JSON bytes) and still be carried inline in its event.
 *
 * Deliberately conservative. Real recorded values are tiny — measured median 5 bytes, p95 26 bytes — so
 * 4KB captures essentially all of them while leaving no room for a single value to threaten an event's
 * size budget on its own. Raising it buys almost nothing and risks the failure described below.
 */
export const EVENT_DOC_VALUE_INLINE_MAX_BYTES = 4 * 1024;

/**
 * The total inline budget for ONE event, across every value it records.
 *
 * This second limit is the one that actually matters, and it exists because a per-value limit is not
 * sufficient: an event such as a node completion carries a whole RECORD of pins, so N values each under
 * the per-value limit can still add up past what an event may hold.
 *
 * The consequence of getting it wrong is severe and silent. Appends do not validate (write-and-go), so an
 * oversized event is written successfully — and then REJECTED by the collection's validator every time the
 * log is folded. `foldEventDocLog` skips a rejected event without a word, so the event is durably stored
 * and permanently invisible: the step simply never happened as far as the document is concerned, with no
 * error at write time and none at read time.
 *
 * 32KB sits far enough below a typical per-event cap (DocGen's flow instances gate at 100KB) that even a
 * node with many pins cannot reach it, while still being orders of magnitude more than observed events
 * need. Anything over budget falls back to an asset, which is always safe.
 */
export const EVENT_DOC_EVENT_INLINE_BUDGET_BYTES = 32 * 1024;
