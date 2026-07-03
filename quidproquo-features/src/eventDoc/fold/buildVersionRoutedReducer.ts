import { QpqReducer } from 'quidproquo-core';

import { EventDocEvent } from '../models';

// Pure version dispatch on event.payload.metadata.version — it does NOT reconcile
// state shapes; foldEventDocLog migrates the accumulator up first, so each vN
// reducer always sees its own shape. Unknown/missing version returns [state, false]
// (skipped on replay, per combineQpqReducers/replayEffects semantics).
export const buildVersionRoutedReducer =
  <TState>(
    reducersByVersion: Record<number, QpqReducer<TState, EventDocEvent>>
  ): QpqReducer<TState, EventDocEvent> =>
  (state, effect) => {
    const version = effect?.payload?.metadata?.version;
    const reducer = version == null ? undefined : reducersByVersion[version];

    if (!reducer) {
      return [state, false];
    }

    return reducer(state, effect);
  };
