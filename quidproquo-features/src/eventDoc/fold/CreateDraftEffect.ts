import { Effect } from 'quidproquo-core';

import { EventDocEffect, EventDocEventPayload } from '../models';

// Reserved: branches a new draft. No data — it only bumps documentVersion (when leaving
// published) and flips status to draft.
export type CreateDraftEffect = Effect<
  EventDocEffect.CreateDraft,
  EventDocEventPayload
>;
