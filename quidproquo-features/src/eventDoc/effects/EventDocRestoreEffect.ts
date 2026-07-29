import { Effect } from 'quidproquo-core';

import { EventDocEffect } from '../models';

// Reserved: undoes a soft delete. The deletion stays in the log (history is append-only);
// the fold simply stops treating the document as deleted from here on.
export type EventDocRestoreEffect = Effect<EventDocEffect.Restore, void>;
