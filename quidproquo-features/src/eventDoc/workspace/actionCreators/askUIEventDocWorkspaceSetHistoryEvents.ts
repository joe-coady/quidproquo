import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocSnapshotBase } from '../../models';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetHistoryEventsEffect } from '../effects/EventDocWorkspaceSetHistoryEventsEffect';

export function* askUIEventDocWorkspaceSetHistoryEvents(
  slotKey: string,
  events: EventDocEvent[],
  base: Nullable<EventDocSnapshotBase> = null,
): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetHistoryEventsEffect>(EventDocWorkspaceEffect.SetHistoryEvents, { slotKey, events, base });
}
