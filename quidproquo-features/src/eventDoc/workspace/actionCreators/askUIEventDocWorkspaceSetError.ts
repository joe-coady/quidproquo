import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetErrorEffect } from '../effects/EventDocWorkspaceSetErrorEffect';

export function* askUIEventDocWorkspaceSetError(slotKey: string, error: Nullable<string>): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetErrorEffect>(EventDocWorkspaceEffect.setError, { slotKey, error });
}
