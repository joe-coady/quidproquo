import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions/eventDocEvent/EventDocApplyEventActionRequester';
import { EventDocWorkspaceChromeEffect } from '../effects/EventDocWorkspaceChromeEffect';
import { EventDocWorkspaceChromeSetHelpOpenEffect } from '../effects/EventDocWorkspaceChromeSetHelpOpenEffect';

export function* askChromeSetHelpOpen(open: boolean): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocWorkspaceChromeSetHelpOpenEffect>(EventDocWorkspaceChromeEffect.SetHelpOpen, { open });
}
