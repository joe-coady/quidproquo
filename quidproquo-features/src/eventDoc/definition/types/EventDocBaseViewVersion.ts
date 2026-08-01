import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../../models';

// A view at the BASE version: it has a seed and no predecessor.
//
// Only the base version can seed. Every log opens with an INIT_STATE stamped version 1
// (askEventDocSeedInitState hardcodes it), so a document created today under schema
// version 5 still starts at the base shape and CLIMBS the migration chain to reach 5.
// That is deliberate: one initial state and one path to any version means a fresh
// document and a migrated one cannot disagree, and every fold exercises the migrations
// rather than leaving them to rot until someone opens an old doc.
export type EventDocBaseViewVersion<TView extends EventDocDocument = EventDocDocument> = {
  // Folds ONE event onto the view. Domain reducers are typed to their own effect union
  // and cast to EventDocEvent at this registration boundary, the same convention as the
  // workspace slot configs.
  foldReducer: QpqReducer<TView, EventDocEvent>;
  createInitialViewState: () => TView;
};
