import { foldEventDocBase } from '../fold/foldEventDocBase';
import { createEventDocEventValidator } from './createEventDocEventValidator';

// The gate a collection gets when it configures NO bespoke validator (backend `defineEventDoc`
// with no `eventValidator`, frontend editor with no `validateEvent`): just the universal lifecycle
// guard — a published document is immutable, rejecting everything but CREATE_DRAFT. It is the
// no-domain-rules case of `createEventDocEventValidator`, folding status generically with
// `foldEventDocBase` (reserved lifecycle events only, no per-collection reducer), so it runs
// identically on the frontend pending buffer and the backend append handler.
export const defaultEventDocEventValidator = createEventDocEventValidator(foldEventDocBase);
