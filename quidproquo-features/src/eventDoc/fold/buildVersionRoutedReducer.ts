import { QpqReducer } from 'quidproquo-core';

import { EventDocEvent } from '../models';

// Pure version dispatch on event.payload.metadata.version — it does NOT reconcile
// state shapes; foldEventDocLog migrates the accumulator up first, so each vN
// reducer always sees its own shape.
//
// An event at a version this view has no reducer for THROWS. It used to return
// [state, false] — a silent skip — which is the worst available failure: a view whose
// version registration is incomplete keeps folding, silently dropping every event from
// the missing version onward, and reads as a document that simply stopped changing.
// A doc type declares every view at every version precisely so this cannot happen, so
// reaching here means the declaration and the log have diverged, and the only safe
// reading of a log you cannot fully fold is none at all.
export const buildVersionRoutedReducer =
  <TState>(reducersByVersion: Record<number, QpqReducer<TState, EventDocEvent>>): QpqReducer<TState, EventDocEvent> =>
  (state, effect) => {
    const version = effect?.payload?.metadata?.version;
    const reducer = version == null ? undefined : reducersByVersion[version];

    if (!reducer) {
      throw new Error(
        `No event-doc fold reducer for schema version ${String(version)} (registered: ${Object.keys(reducersByVersion).join(', ') || 'none'}).`,
      );
    }

    return reducer(state, effect);
  };
