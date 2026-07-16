// A last-write-wins coalescing rule for a slot's stream. A bare event-type string
// coalesces ALL events of that type into the latest (one-per-type, e.g. SET_CSS,
// SET_NAME). The `{ type, key }` form coalesces PER ITEM: only events whose payload
// `data[key]` matches the incoming one are superseded, so editing one item in a list
// (a per-item field keyed on the item's `id`) doesn't clobber another item's pending
// edit. Unlisted types always append.
export type CoalesceEventType = string | { type: string; key: string };
