import { Nullable } from 'quidproquo-core';

import { EventDocEditorValidator } from '../../validation';
import { EventDocWorkspaceState } from './EventDocWorkspaceState';

// Everything the ApplyEvent/ReadState overrides need, closured in at bind time.
// Coalesce rules are NOT here: coalescing happens atomically in the reducer (see
// createApplyEventUpdater), so parallel commits can't clobber each other's buffer.
// Every commit lands in the slot's pending buffer (history is server truth only), so
// there is no routing flag: local slots just never save their pending.
export type EventDocWorkspaceSlotBinding = {
  slotKey: string;
  schemaVersion: number;
  validate: Nullable<EventDocEditorValidator>;
  // The slot's memoized view selector, answering askEventDocReadState with the doc's
  // current folded state (history + pending + transient). unknown at this altitude —
  // the per-doc createEventDocStateReader owns the narrowing.
  getView: (state: EventDocWorkspaceState) => unknown;
};
