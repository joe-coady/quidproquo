import { EventDocWorkspaceSlotFoldConfig } from './types/EventDocWorkspaceSlotFoldConfig';
import { EventDocWorkspaceStoryApi } from './types/EventDocWorkspaceStoryApi';

// Composes a full workspace slot config from its api-free fold config plus the
// slot's api — the workspace-file counterpart of createEventDocWorkspaceSelectors.
// An editor defines its folds once (`<x>SlotFolds.ts`, no api imports), builds its
// selectors from them, and the workspace assembles each slot with this helper:
//
//   [documentSlotKey]: createEventDocWorkspaceSlot(slotFolds[documentSlotKey], api)
//
// Both generics stay precise (TFold & { api: TApi }), so createEventDocWorkspace
// infers exact per-slot view and api types from the composed result.
export const createEventDocWorkspaceSlot = <TFold extends EventDocWorkspaceSlotFoldConfig, TApi extends EventDocWorkspaceStoryApi>(
  fold: TFold,
  api: TApi,
): TFold & { api: TApi } => ({
  ...fold,
  api,
});
