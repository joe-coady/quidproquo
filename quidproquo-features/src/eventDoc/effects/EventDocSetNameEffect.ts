import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocSetNameData } from '../models';

// Reserved: edits the document name. Generic: folded by the base reducer.
export type EventDocSetNameEffect = Effect<EventDocEffect.SetName, EventDocSetNameData>;
