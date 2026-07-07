import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocEventPayload, EventDocSetNameData } from '../models';

// Reserved: edits the document name. Generic — folded by the base reducer.
export type SetNameEffect = Effect<EventDocEffect.SetName, EventDocEventPayload<EventDocSetNameData>>;
