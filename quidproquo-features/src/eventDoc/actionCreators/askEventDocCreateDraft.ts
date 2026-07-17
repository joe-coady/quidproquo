import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../actions/eventDocEvent/EventDocApplyEventActionRequester';
import { EventDocCreateDraftEffect } from '../effects/EventDocCreateDraftEffect';
import { EventDocEffect } from '../models';

export function* askEventDocCreateDraft(): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocCreateDraftEffect>(EventDocEffect.CreateDraft, undefined);
}
