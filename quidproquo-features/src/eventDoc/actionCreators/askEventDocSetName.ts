import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../actions/eventDocEvent/EventDocApplyEventActionRequester';
import { EventDocSetNameEffect } from '../effects/EventDocSetNameEffect';
import { EventDocEffect } from '../models';

export function* askEventDocSetName(name: string): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocSetNameEffect>(EventDocEffect.SetName, { name });
}
