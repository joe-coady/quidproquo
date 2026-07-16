import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetHistoryEventsEffect } from '../effects/EventDocWorkspaceSetHistoryEventsEffect';

export function* askUIEventDocWorkspaceSetHistoryEvents(slotKey: string, events: EventDocEvent[]): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetHistoryEventsEffect>(EventDocWorkspaceEffect.setHistoryEvents, { slotKey, events });
}
