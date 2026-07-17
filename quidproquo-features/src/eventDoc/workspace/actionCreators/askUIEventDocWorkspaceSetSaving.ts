import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceSetSavingEffect } from '../effects/EventDocWorkspaceSetSavingEffect';

export function* askUIEventDocWorkspaceSetSaving(slotKey: string, isSaving: boolean): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceSetSavingEffect>(EventDocWorkspaceEffect.SetSaving, { slotKey, isSaving });
}
