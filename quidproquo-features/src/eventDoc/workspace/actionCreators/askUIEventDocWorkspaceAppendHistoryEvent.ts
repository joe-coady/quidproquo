import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceAppendHistoryEventEffect } from '../effects/EventDocWorkspaceAppendHistoryEventEffect';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';

export function* askUIEventDocWorkspaceAppendHistoryEvent(slotKey: string, event: EventDocEvent): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceAppendHistoryEventEffect>(EventDocWorkspaceEffect.appendHistoryEvent, { slotKey, event });
}
