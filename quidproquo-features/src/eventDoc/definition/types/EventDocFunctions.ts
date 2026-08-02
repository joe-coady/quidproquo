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
};
