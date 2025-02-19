import { AskResponseReturnType, Story } from 'quidproquo-core';

import { useMemo, useState } from 'react';

import { QpqBubbleReducer, useBubblingReducer } from '../useBubbleReducer';
import { useQpq } from '../useQpq';
import { getStateDispatchActionListResolver } from './actionProcessor';

export function useQpqReducer<TState, TAction, TApi extends Record<string, Story<any, any>>>(
  apiGenerators: TApi,
  reducer: QpqBubbleReducer<TState, TAction> = (s) => [s, false],
  initialState: TState = {} as TState,
): [
  {
    [K in keyof TApi]: (...args: Parameters<TApi[K]>) => Promise<AskResponseReturnType<ReturnType<TApi[K]>>>;
  },
  TState,
  (action: any) => void,
] {
  const [state, dispatch] = useBubblingReducer(reducer, initialState);

  // Api generators CAN NEVER CHANGE and are memoized to prevent unnecessary re-renders.
  const [memoedApiGenerators] = useState(() => apiGenerators);
  const resolver = useQpq(getStateDispatchActionListResolver(dispatch));

  // Wrap each API generator using the resolver.
  const api = useMemo(() => {
    const wrapped: Partial<{
      [K in keyof TApi]: (...args: Parameters<TApi[K]>) => Promise<AskResponseReturnType<ReturnType<TApi[K]>>>;
    }> = {};

    for (const key in memoedApiGenerators) {
      if (Object.prototype.hasOwnProperty.call(memoedApiGenerators, key)) {
        // The resolver already returns a function that takes the arguments and returns a promise of the final return type.
        wrapped[key] = resolver(memoedApiGenerators[key]);
      }
    }
    return wrapped as {
      [K in keyof TApi]: (...args: Parameters<TApi[K]>) => Promise<AskResponseReturnType<ReturnType<TApi[K]>>>;
    };
  }, [resolver]);

  return [api, state, dispatch];
}
