import { Effect } from 'quidproquo-core';

import { EventDocEffect } from '../models';

// Reserved: branches a new draft. Carries no data, it only bumps documentVersion (when
// leaving published) and flips status to draft. The payload is `unknown` (not
// `undefined`) so the stored fold shape stays EventDocEventPayload's default; callers
// pass undefined.
export type EventDocCreateDraftEffect = Effect<EventDocEffect.CreateDraft, unknown>;
