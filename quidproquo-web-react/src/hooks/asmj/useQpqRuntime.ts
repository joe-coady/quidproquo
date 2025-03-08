import { Story } from 'quidproquo-core';

import { useEffect, useMemo, useState } from 'react';

import { useQpq } from '../useQpq';
import { getStateActionProcessor } from '../useQpqReducer/actionProcessor';
import { QpqApi, QpqMappedApi } from './QpqMappedApi';
import { useQpqRuntimeBubblingReducer } from './QpqRuntimeEffectCatcher';
import { QpqRuntimeDefinition } from '.';

export function useQpqRuntime<
  TState,
  TAction,
  // Constrain TApi so that all keys must start with "ask"
  TApi extends QpqApi,
>(
  atom: QpqRuntimeDefinition<TState, TAction, TApi>,
  mainStory?: Story<any, any>,
  name?: string,
): [QpqMappedApi<TApi>, TState, (action: any) => void] {
  const atomInfo = atom(name);
  const [state, dispatch, getCurrentState] = useQpqRuntimeBubblingReducer<TState, TAction, TApi>(atom, name);

  // Api generators are memoized to prevent unnecessary re-renders.
  const [memoedApiGenerators] = useState(() => atomInfo.api);
  const resolver = useQpq(getStateActionProcessor(dispatch, getCurrentState));

  // Wrap and remap each API generator using the resolver.
  const api = useMemo(() => {
    const wrapped: Record<string, any> = {};
    for (const key in memoedApiGenerators) {
      if (Object.prototype.hasOwnProperty.call(memoedApiGenerators, key)) {
        // Remove the 'ask' prefix and lower-case the first character.
        const withoutAsk = key.slice(3); // e.g., "FetchTodos"
        const newKey = withoutAsk.charAt(0).toLowerCase() + withoutAsk.slice(1); // "fetchTodos"
        // We know newKey matches our mapped type so we can assign.
        // (A type assertion is used here to quiet the compiler.)
        wrapped[newKey] = resolver(memoedApiGenerators[key as any]) as any;
      }
    }
    return wrapped;
  }, [resolver, memoedApiGenerators]);

  useEffect(() => {
    if (mainStory) {
      resolver(mainStory)();
    }
  }, []);

  return [api as QpqMappedApi<TApi>, state, dispatch];
}
