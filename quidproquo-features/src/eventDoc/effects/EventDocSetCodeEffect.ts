import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocSetCodeData } from '../models';

// Reserved: edits the document code. Generic: folded by the base reducer.
export type EventDocSetCodeEffect = Effect<EventDocEffect.SetCode, EventDocSetCodeData>;
