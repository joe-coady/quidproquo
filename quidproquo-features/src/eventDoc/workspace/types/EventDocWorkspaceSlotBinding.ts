import { Nullable } from 'quidproquo-core';

import { EventDocEditorValidator } from '../../validation';

// Everything the ApplyEvent override needs, closured in at bind time. Coalesce rules
// are NOT here: coalescing happens atomically in the reducer (see
// createApplyEventUpdater), so parallel commits can't clobber each other's buffer.
export type EventDocWorkspaceSlotBinding = {
  slotKey: string;
  // document slots buffer commits (pending); local slots write straight to history.
  isPending: boolean;
  schemaVersion: number;
  validate: Nullable<EventDocEditorValidator>;
};
