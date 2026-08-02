import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetFullHistoryEffect } from '../effects/EventDocWorkspaceSetFullHistoryEffect';
import { EventDocWorkspaceHistoryPage } from '../types/EventDocWorkspaceHistoryPage';

export function* askUIEventDocWorkspaceSetFullHistory(slotKey: string, history: Nullable<EventDocWorkspaceHistoryPage>): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetFullHistoryEffect>(EventDocWorkspaceEffect.SetFullHistory, { slotKey, history });
}
