import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocEventPayload, EventDocInitData } from '../models';

// The opening event every log carries; the fold maps it to the document's initial state
// stamped with its identity (id/code/name). Generic — built into the fold reducer, never
// re-declared per module.
export type InitStateEffect = Effect<EventDocEffect.InitState, EventDocEventPayload<EventDocInitData>>;
