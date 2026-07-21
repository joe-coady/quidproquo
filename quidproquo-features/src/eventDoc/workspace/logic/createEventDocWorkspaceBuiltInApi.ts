import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { EventDocWorkspaceBuiltInApi } from '../types/EventDocWorkspaceBuiltInApi';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceTransport } from '../types/EventDocWorkspaceTransport';
import { askEventDocWorkspaceCancel } from './askEventDocWorkspaceCancel';
import { askEventDocWorkspaceInit } from './askEventDocWorkspaceInit';
import { askEventDocWorkspaceRefresh } from './askEventDocWorkspaceRefresh';
import { askEventDocWorkspaceRestoreLocalPending } from './askEventDocWorkspaceRestoreLocalPending';
import { askEventDocWorkspaceSave } from './askEventDocWorkspaceSave';

// Init/save/refresh need the backend; cancel is pure state. The transport is optional
// on the definition so state-only workspaces (all-local slots) stay zero-config, but
// using a transport verb without one fails loudly instead of silently doing nothing.
function* askEnsureTransport(transport?: EventDocWorkspaceTransport): AskResponse<EventDocWorkspaceTransport> {
  if (!transport) {
    return yield* askThrowError(
      ErrorTypeEnum.Invalid,
      'This EventDocWorkspace was created without a transport - pass one to createEventDocWorkspace to use init/save/refresh.',
    );
  }

  return transport;
}

const resolveSlotKeys = (documentSlotKeys: string[], slotKey?: string): string[] =>
  slotKey === undefined ? documentSlotKeys : documentSlotKeys.filter((documentSlotKey) => documentSlotKey === slotKey);

const getAskInit = (transport: EventDocWorkspaceTransport | undefined, documentSlotKeys: string[], localSlotKeys: string[]) =>
  function* askInit(identities: Record<string, EventDocWorkspaceDocumentIdentity>, snapshot?: EventDocWorkspaceSnapshot): AskResponse<void> {
    // Local streams first: pure state, no transport, and the document loads run in
    // parallel after — order between the two is immaterial.
    yield* askEventDocWorkspaceRestoreLocalPending(snapshot ?? null, localSlotKeys);

    // Unknown keys are dropped rather than growing phantom slots.
    const known = Object.fromEntries(Object.entries(identities).filter(([slotKey]) => documentSlotKeys.includes(slotKey)));

    yield* askEventDocWorkspaceInit(yield* askEnsureTransport(transport), known, snapshot ?? null);
  };

const getAskSave = (transport: EventDocWorkspaceTransport | undefined, documentSlotKeys: string[]) =>
  function* askSave(slotKey?: string): AskResponse<void> {
    yield* askEventDocWorkspaceSave(yield* askEnsureTransport(transport), resolveSlotKeys(documentSlotKeys, slotKey));
  };

const getAskCancel = (documentSlotKeys: string[]) =>
  function* askCancel(slotKey?: string): AskResponse<void> {
    yield* askEventDocWorkspaceCancel(resolveSlotKeys(documentSlotKeys, slotKey));
  };

const getAskRefresh = (transport: EventDocWorkspaceTransport | undefined, documentSlotKeys: string[]) =>
  function* askRefresh(slotKey?: string): AskResponse<void> {
    yield* askEventDocWorkspaceRefresh(yield* askEnsureTransport(transport), resolveSlotKeys(documentSlotKeys, slotKey));
  };

export const createEventDocWorkspaceBuiltInApi = (
  transport: EventDocWorkspaceTransport | undefined,
  documentSlotKeys: string[],
  localSlotKeys: string[],
): EventDocWorkspaceBuiltInApi => ({
  askInit: getAskInit(transport, documentSlotKeys, localSlotKeys),
  askSave: getAskSave(transport, documentSlotKeys),
  askCancel: getAskCancel(documentSlotKeys),
  askRefresh: getAskRefresh(transport, documentSlotKeys),
});
