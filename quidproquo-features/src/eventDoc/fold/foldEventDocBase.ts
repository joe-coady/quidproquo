import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { reservedEventDocEventValidators } from '../validation/reservedEventDocEventValidators';
import { buildEventDocBaseReducer } from './buildEventDocBaseReducer';
import { createEventDocInitialDocumentState } from './createEventDocInitialDocumentState';
import { foldEventDocLog } from './foldEventDocLog';

// Folds ONLY the reserved/base events (INIT_STATE, SET_CODE, SET_NAME, CREATE_DRAFT,
// PUBLISH) into the universal EventDocDocument fields. Domain events bubble unhandled
// (so css/html/etc. are ignored), and `updatedAt` still advances per event because
// foldEventDocLog stamps it outside the reducer — so code/name/status/documentVersion/
// createdAt/updatedAt come out IDENTICAL to a full per-collection fold, with no
// per-collection reducer needed. The base document is schema-version-agnostic, so the
// fold pins version 1 with no migrations (each event's version is clamped to 1).
const baseSeed = (): EventDocDocument => createEventDocInitialDocumentState(1);

const baseReducer = buildEventDocBaseReducer(baseSeed) as QpqReducer<EventDocDocument, EventDocEvent>;

// Validated with the RESERVED registry: since appends no longer validate, the universal
// lifecycle guard has to be applied somewhere, and the base fold is the one path every
// collection shares. A second PUBLISH racing the first is ignored here rather than
// doubling the version history. Collections with domain rules pass their own registry
// (reserved entries spread in via createEventDocEventValidator) to their own fold.
export const foldEventDocBase = (events: EventDocEvent[]): EventDocDocument =>
  foldEventDocLog(events, {
    seed: baseSeed(),
    reducer: baseReducer,
    migrations: {},
    latestVersion: 1,
    validators: reservedEventDocEventValidators,
  });
