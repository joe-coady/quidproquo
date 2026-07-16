import { AskResponse, Nullable } from 'quidproquo-core';

import { askApplyEventDocEvent } from '../../../actions';
import { EventDocWorkspaceChromeEvent } from '../EventDocWorkspaceChromeEvent';
import { EventDocWorkspaceChromeSetHistorySlotKeyData } from '../types/EventDocWorkspaceChromeSetHistorySlotKeyData';

export function* askChromeSetHistorySlotKey(slotKey: Nullable<string>): AskResponse<void> {
  yield* askApplyEventDocEvent(EventDocWorkspaceChromeEvent.setHistorySlotKey, { slotKey } satisfies EventDocWorkspaceChromeSetHistorySlotKeyData);
}
