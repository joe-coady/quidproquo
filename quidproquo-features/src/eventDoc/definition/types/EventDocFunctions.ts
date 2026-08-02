import { AskResponse, Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocLink, EventDocRenderInput, EventDocRenderResult, EventDocSnapshotViews } from '../../models';

// The callable surface a collection registers via defineDynamicFunctions - the object
// defineEventDoc takes alongside its runtime path. A saved EventDocDefinition satisfies
// it structurally (identity + foldSnapshotViews + collectReferences), so a collection
// with no custom render registers its definition verbatim; extendEventDocFunctions adds
// service-side extensions like render without touching the definition.
export type EventDocFunctions = {
  // The collection's identity, read off the live object at config time.
  storeName?: string;
  type?: string;

  // Every view of the log prefix, era-pinned - what a snapshot stores. Invoked by the
  // event store's stream projector (was the `snapshotFold` inline function).
  foldSnapshotViews: (events: EventDocEvent[], seedViews?: EventDocSnapshotViews) => Nullable<EventDocSnapshotViews>;

  // The EventDocLinks this doc's whole log has ever depended on; [] for a leaf doc type.
  // Invoked by the transfer manifest walk (was the `referenceResolver`).
  collectReferences: (events: EventDocEvent[]) => EventDocLink[];

  // The EventDocLinks the CURRENT state depends on; [] for a leaf doc type. Invoked by
  // the references route against a snapshot-seeded folded state.
  collectReferencesFromState: (state: unknown) => EventDocLink[];

  // The document view at one point, latest-shaped, resumable from a stored snapshot's
  // era-pinned document state. Invoked by the render/references/as-of reads and the
  // append hooks' state derivation.
  foldDocumentState: (events: EventDocEvent[], seedState?: unknown) => unknown;

  // Fold + render the resolved log (was the `eventRenderer`). Optional: a collection
  // without one 404s its render route. Plain function or story - the dynamic-functions
  // processor runs either.
  render?: (input: EventDocRenderInput) => EventDocRenderResult | AskResponse<EventDocRenderResult>;

  // The PRE-WRITE gate: the append path resolves the document's current state
  // (snapshot-seeded) and runs this BEFORE writing; a non-null reason rejects the append
  // so the event never enters the log. The fold's acceptance still drops anything that
  // slips past (a race, an unregistered collection) — this exists because some rules must
  // stop the WRITE itself (an append-only log holds a smuggled value forever). A saved
  // definition supplies its editor validator here (same registry as the fold's gate);
  // extendEventDocFunctions can wrap it with service-side I/O gates (a story is fine).
  validateEvent?: (event: EventDocEvent, state: unknown) => Nullable<string> | AskResponse<Nullable<string>>;
};
