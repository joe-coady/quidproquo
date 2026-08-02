import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetFullHistoryEffect } from '../effects/EventDocWorkspaceSetFullHistoryEffect';

export function* askUIEventDocWorkspaceSetFullHistory(slotKey: string, events: Nullable<EventDocEvent[]>): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetFullHistoryEffect>(EventDocWorkspaceEffect.SetFullHistory, { slotKey, events });
}
