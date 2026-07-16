import { AskResponse } from 'quidproquo-core';

import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceSaveSlot } from './askEventDocWorkspaceSaveSlot';

// Workspace Save: stream every requested slot (the built-in defaults to every document
// slot). Sequential across slots: each slot is itself strictly serial, and cross-slot
// ordering stays deterministic for reference dependencies until a real case needs
// parallelism.
export function* askEventDocWorkspaceSave(transport: EventDocWorkspaceTransport, slotKeys: string[]): AskResponse<void> {
  for (const slotKey of slotKeys) {
    yield* askEventDocWorkspaceSaveSlot(transport, slotKey);
  }
}
