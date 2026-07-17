import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocPublishData } from '../models';

// Reserved: publishes the current draft. `effectiveFrom` is kept for later as-of
// rendering; the fold only flips status to published.
export type EventDocPublishEffect = Effect<EventDocEffect.Publish, EventDocPublishData>;
