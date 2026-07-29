import { Effect } from 'quidproquo-core';

import { EventDocEffect } from '../models';

// Reserved: soft-deletes the document. No payload — the actor and time already ride on
// every event's metadata, which is exactly what `deletedAt`/`deletedBy` are derived from.
export type EventDocDeleteEffect = Effect<EventDocEffect.Delete, void>;
