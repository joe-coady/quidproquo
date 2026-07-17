import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocInitData } from '../models';

// The opening event every log carries (index 0), seeded by the backend at create; the
// fold maps it to the document's initial state stamped with its identity (id/code/name).
export type EventDocInitStateEffect = Effect<EventDocEffect.InitState, EventDocInitData>;
