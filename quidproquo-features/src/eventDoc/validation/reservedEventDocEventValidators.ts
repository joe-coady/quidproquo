import { EventDocEffect } from '../models';
import { EventDocEventValidators } from './types/EventDocEventValidators';
import { forbidInit } from './validators/forbidInit';
import { requireDraft } from './validators/requireDraft';
import { requirePublished } from './validators/requirePublished';

// The universal lifecycle rules every event-doc document obeys, keyed by reserved
// effect. The '*' fallback (draft-only) covers SET_NAME/SET_CODE and every domain edit,
// so a published document rejects everything except CREATE_DRAFT. Apps spread this into
// their own registry and override entries to add payload/domain rules.
export const reservedEventDocEventValidators: EventDocEventValidators = {
  [EventDocEffect.InitState]: forbidInit,
  [EventDocEffect.CreateDraft]: requirePublished,
  [EventDocEffect.Publish]: requireDraft,
  '*': requireDraft,
};
