import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../actions/eventDocEvent/askApplyEventDocEvent';
import { EventDocPublishEffect } from '../effects/EventDocPublishEffect';
import { EventDocEffect, EventDocPublishData } from '../models';

export function* askEventDocPublish(data: EventDocPublishData): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocPublishEffect>(EventDocEffect.Publish, data);
}
