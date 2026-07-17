import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceAppendHistoryEventsEffect } from '../effects/EventDocWorkspaceAppendHistoryEventsEffect';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';

export function* askUIEventDocWorkspaceAppendHistoryEvents(slotKey: string, events: EventDocEvent[]): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceAppendHistoryEventsEffect>(EventDocWorkspaceEffect.AppendHistoryEvents, { slotKey, events });
}
