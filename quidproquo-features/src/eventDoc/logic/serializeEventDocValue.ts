/**
 * The one place a recorded value's JSON form and byte size are computed.
 *
 * Shared by the write path (to decide inline vs asset) and by any caller measuring a value against a
 * budget, so a value can never be judged small enough to inline by one rule and sized differently by
 * another.
 *
 * `undefined` becomes `'null'`: JSON.stringify(undefined) returns undefined rather than a string, and
 * buffering that throws. A node whose HTTP call returns an empty body produces exactly that, and it must
 * route its `failed` branch rather than fail the run inside persistence.
 *
 * Bytes are measured as UTF-8 via TextEncoder (exact, and available in both Node and the browser), not as
 * string length — a multi-byte character would otherwise be undercounted and could push an event past a
 * cap that was checked as if it fit.
 */
export const serializeEventDocValue = (value: unknown): { json: string; bytes: number } => {
  const json = JSON.stringify(value) ?? 'null';

  return { json, bytes: new TextEncoder().encode(json).length };
};
