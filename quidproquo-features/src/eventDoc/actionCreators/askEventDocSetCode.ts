import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../actions/eventDocEvent/askApplyEventDocEvent';
import { EventDocSetCodeEffect } from '../effects/EventDocSetCodeEffect';
import { EventDocEffect } from '../models';

export function* askEventDocSetCode(code: string): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocSetCodeEffect>(EventDocEffect.SetCode, { code });
}
