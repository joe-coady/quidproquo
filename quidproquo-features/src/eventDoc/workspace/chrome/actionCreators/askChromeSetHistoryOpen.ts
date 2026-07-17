import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions/eventDocEvent/EventDocApplyEventActionRequester';
import { EventDocWorkspaceChromeEffect } from '../effects/EventDocWorkspaceChromeEffect';
import { EventDocWorkspaceChromeSetHistoryOpenEffect } from '../effects/EventDocWorkspaceChromeSetHistoryOpenEffect';

// Scope-blind like any event-doc action creator: the commit lands on whichever
// workspace slot this verb is bound to (the factory binds it to the chrome slot,
// a local slot, so it lands straight in history).
export function* askChromeSetHistoryOpen(open: boolean): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocWorkspaceChromeSetHistoryOpenEffect>(EventDocWorkspaceChromeEffect.SetHistoryOpen, { open });
}
