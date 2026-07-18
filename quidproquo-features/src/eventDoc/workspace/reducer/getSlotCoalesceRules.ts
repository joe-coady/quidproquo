import { reservedEventDocWorkspaceCoalesceEventTypes } from '../constants/reservedEventDocWorkspaceCoalesceEventTypes';
import { EventDocWorkspaceCoalesceRules } from '../types/EventDocWorkspaceCoalesceRules';
import { EventDocWorkspaceSlotFoldConfig } from '../types/EventDocWorkspaceSlotFoldConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';

// The pending-buffer coalesce rules for one slot. Document slots always carry the
// reserved field-setter rules ahead of their own; local slots default to 'all'
// (last-write-wins for every type), so session streams like chrome hold one pending
// event per field instead of growing per toggle.
export const getSlotCoalesceRules = (slot: EventDocWorkspaceSlotFoldConfig): EventDocWorkspaceCoalesceRules =>
  slot.kind === EventDocWorkspaceSlotKind.document
    ? [...reservedEventDocWorkspaceCoalesceEventTypes, ...(slot.coalesceEventTypes ?? [])]
    : (slot.coalesceEventTypes ?? 'all');
