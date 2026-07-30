import { EventDocValueRef } from '../models';

/**
 * Narrow a value ref to its inline form.
 *
 * Exists as a named guard rather than an inline `ref.kind === 'inline'` check because every READER has to
 * branch on this, and each of those branches is the difference between zero I/O and a presign-plus-download
 * round trip. Naming it makes the fast path obvious at each call site and keeps the discriminant in one
 * place if the union ever gains a third kind.
 */
export const isInlineEventDocValueRef = (ref: EventDocValueRef): ref is Extract<EventDocValueRef, { kind: 'inline' }> => ref.kind === 'inline';
