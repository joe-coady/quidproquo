import { Nullable } from 'quidproquo-core';

import { EventDocEditorValidator } from '../../validation';

// Everything the ApplyEvent override needs, closured in at bind time. Coalesce rules
// are NOT here: coalescing happens atomically in the reducer (see
// createApplyEventUpdater), so parallel commits can't clobber each other's buffer.
// Every commit lands in the slot's pending buffer (history is server truth only), so
// there is no routing flag: local slots just never save their pending.
export type EventDocWorkspaceSlotBinding = {
  slotKey: string;
  schemaVersion: number;
  validate: Nullable<EventDocEditorValidator>;
};
