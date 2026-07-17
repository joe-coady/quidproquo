import { AskResponse, Nullable } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions/eventDocEvent/EventDocApplyEventActionRequester';
import { EventDocWorkspaceChromeEffect } from '../effects/EventDocWorkspaceChromeEffect';
import { EventDocWorkspaceChromeSetHistorySlotKeyEffect } from '../effects/EventDocWorkspaceChromeSetHistorySlotKeyEffect';

export function* askChromeSetHistorySlotKey(slotKey: Nullable<string>): AskResponse<void> {
  yield* askApplyEventDocEvent<EventDocWorkspaceChromeSetHistorySlotKeyEffect>(EventDocWorkspaceChromeEffect.SetHistorySlotKey, { slotKey });
}
