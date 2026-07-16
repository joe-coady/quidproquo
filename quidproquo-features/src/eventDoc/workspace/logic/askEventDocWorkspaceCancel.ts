import { AskResponse } from 'quidproquo-core';

import { askUIEventDocWorkspaceSetError } from '../actionCreators/askUIEventDocWorkspaceSetError';
import { askUIEventDocWorkspaceSetPendingEvents } from '../actionCreators/askUIEventDocWorkspaceSetPendingEvents';

// Cancel = discard the pending buffer. The folded view reverts reactively: the saved
// log is untouched, so there is no draft to re-seed.
export function* askEventDocWorkspaceCancel(slotKeys: string[]): AskResponse<void> {
  for (const slotKey of slotKeys) {
    yield* askUIEventDocWorkspaceSetPendingEvents(slotKey, []);
    yield* askUIEventDocWorkspaceSetError(slotKey, null);
  }
}
