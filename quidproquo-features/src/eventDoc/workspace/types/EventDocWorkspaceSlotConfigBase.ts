import { QpqReducer } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocEditorValidator } from '../../validation';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

// The shape shared by document and local slot configs.
export type EventDocWorkspaceSlotConfigBase<TView, TApi extends EventDocWorkspaceStoryApi> = {
  // Scope-blind domain verbs; the factory binds them to this slot's stream.
  api: TApi;
  // Folds ONE event onto the view. Domain reducers are typed to their own effect
  // union and cast to EventDocEvent at this registration boundary, the same
  // convention as foldEventDocLog call sites.
  foldReducer: QpqReducer<TView, EventDocEvent>;
  createInitialViewState: () => TView;
  // The schema version this slot authors at; stamped on every committed event and
  // used as the fold target for document slots. Defaults to 1.
  schemaVersion?: number;
  // Runs against the slot's live log (saved + pending) before a commit lands; the
  // same contract the backend enforces on append. Document slots fall back to the
  // universal lifecycle guard; local slots default to accept-all.
  validate?: EventDocEditorValidator;
};
