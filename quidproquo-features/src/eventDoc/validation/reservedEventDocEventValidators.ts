import { EventDocEffect } from '../models';
import { EventDocEventValidators } from './types/EventDocEventValidators';
import { allOf } from './validators/allOf';
import { forbidInit } from './validators/forbidInit';
import { requireDeleted } from './validators/requireDeleted';
import { requireDraft } from './validators/requireDraft';
import { requireNotDeleted } from './validators/requireNotDeleted';
import { requirePublished } from './validators/requirePublished';

// The universal lifecycle rules every event-doc document obeys, keyed by reserved effect.
// The '*' fallback covers SET_NAME/SET_CODE and every domain edit, so a published document
// rejects everything except CREATE_DRAFT, and a deleted one rejects everything except
// RESTORE. Apps spread this into their own registry and override entries to add
// payload/domain rules.
//
// DELETE deliberately does NOT inherit the draft-only fallback: a published document must be
// deletable without first branching a draft. It only requires that the document is not
// already deleted, so a repeat delete is rejected rather than recorded twice.
export const reservedEventDocEventValidators: EventDocEventValidators = {
  [EventDocEffect.InitState]: forbidInit,
  [EventDocEffect.CreateDraft]: allOf(requireNotDeleted, requirePublished),
  [EventDocEffect.Publish]: allOf(requireNotDeleted, requireDraft),
  [EventDocEffect.Delete]: requireNotDeleted,
  [EventDocEffect.Restore]: requireDeleted,
  '*': allOf(requireNotDeleted, requireDraft),
};
