/**
 * Generates a new random (version 4) UUID.
 *
 * This is the single place in quidproquo to mint a v4 UUID. It uses the native
 * `crypto.randomUUID()` which is available in Node 20+ and all modern browsers
 * (secure contexts), so it works across both backend and frontend packages with
 * no external dependency. Centralising it here means the underlying source can be
 * swapped in one spot if that ever changes.
 *
 * @returns {string} A randomly generated v4 UUID, e.g. `109156be-c4fb-41ea-b1b4-efe1671c5836`.
 */
export function generateUuid(): string {
  return globalThis.crypto.randomUUID();
}
