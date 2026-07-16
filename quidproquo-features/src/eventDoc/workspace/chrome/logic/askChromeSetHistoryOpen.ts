import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions';
import { EventDocWorkspaceChromeEvent } from '../EventDocWorkspaceChromeEvent';
import { EventDocWorkspaceChromeSetOpenData } from '../types/EventDocWorkspaceChromeSetOpenData';

// Scope-blind like any domain verb: works because the factory binds it to the chrome
// slot (a local slot, so commits land straight in history).
export function* askChromeSetHistoryOpen(open: boolean): AskResponse<void> {
  yield* askApplyEventDocEvent(EventDocWorkspaceChromeEvent.setHistoryOpen, { open } satisfies EventDocWorkspaceChromeSetOpenData);
}
