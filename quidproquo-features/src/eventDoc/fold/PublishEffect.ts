import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocEventPayload, EventDocPublishData } from '../models';

// Reserved: publishes the current draft. `effectiveFrom` is kept for later as-of
// rendering; the fold only flips status to published.
export type PublishEffect = Effect<EventDocEffect.Publish, EventDocEventPayload<EventDocPublishData>>;
