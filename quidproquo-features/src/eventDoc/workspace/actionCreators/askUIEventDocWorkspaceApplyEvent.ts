import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceApplyEventEffect } from '../effects/EventDocWorkspaceApplyEventEffect';
import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';

export function* askUIEventDocWorkspaceApplyEvent(slotKey: string, isPending: boolean, event: EventDocEvent): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocWorkspaceApplyEventEffect>(EventDocWorkspaceEffect.applyEvent, { slotKey, isPending, event });
}
