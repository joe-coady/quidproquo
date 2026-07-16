import { AskResponse } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions';
import { EventDocWorkspaceChromeEvent } from '../EventDocWorkspaceChromeEvent';
import { EventDocWorkspaceChromeSetOpenData } from '../types/EventDocWorkspaceChromeSetOpenData';

export function* askChromeSetHelpOpen(open: boolean): AskResponse<void> {
  yield* askApplyEventDocEvent(EventDocWorkspaceChromeEvent.setHelpOpen, { open } satisfies EventDocWorkspaceChromeSetOpenData);
}
