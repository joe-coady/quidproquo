import { EventDocEvent } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from './EventDocWorkspaceDocumentIdentity';

// A serializable capture of everything worth carrying ACROSS a workspace runtime
// (e.g. hot-swapping a federated editor bundle): per document slot, which doc the
// slot was bound to and the unsaved pending buffer — pure client intent. History is
// server truth (refetched on init), historyViews is a derived fold, and transient
// events are never-saved observations, so none of them belong here. Pending events
// keep their authored schema version; a snapshot restored into a newer module forms
// a legitimate mixed-version tail (see foldEventDocLiveView).
export type EventDocWorkspaceSlotSnapshot = {
  documentIdentity: EventDocWorkspaceDocumentIdentity;
  pending: EventDocEvent[];
};

export type EventDocWorkspaceSnapshot = {
  slots: Record<string, EventDocWorkspaceSlotSnapshot>;
};
