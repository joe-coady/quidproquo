import { createEventDocEventValidator } from './createEventDocEventValidator';

// The gate a collection gets when it configures NO bespoke validator (backend `defineEventDoc`
// with no domain validators, frontend editor with no `validateEvent`): just the universal
// lifecycle guard — a published document is immutable, rejecting everything but CREATE_DRAFT.
// It is the no-domain-rules case of `createEventDocEventValidator`, reading status off the
// folded state the caller supplies.
export const defaultEventDocEventValidator = createEventDocEventValidator();
