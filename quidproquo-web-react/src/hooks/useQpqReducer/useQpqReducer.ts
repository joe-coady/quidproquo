import { AskResponse, AskResponseReturnType, Story } from 'quidproquo-core';

import { useMemo, useState } from 'react';

import { QpqBubbleReducer, useBubblingReducer } from '../useBubbleReducer';
import { useQpq } from '../useQpq';
import { getStateActionProcessor } from './actionProcessor';

// Helper type to remap keys from "askXyz" to "xyz" (with lowercase first letter)
type RemoveAskPrefix<K extends string> = K extends `ask${infer R}` ? Uncapitalize<R> : never;

// Define the mapped API type.
// We extract only string keys and then use a conditional type to infer parameters and return type.
type MappedApi<TApi extends Record<`ask${string}`, Story<any, any>>> = {
  [K in Extract<keyof TApi, string> as RemoveAskPrefix<K>]: TApi[K] extends (...args: infer P) => infer R
    ? R extends AskResponse<any>
      ? (...args: P) => Promise<AskResponseReturnType<R>>
      : never
    : never;
};

export function useQpqReducer<
  TState,
  TAction,
  // Constrain TApi so that all keys must start with "ask"
  TApi extends Record<`ask${string}`, Story<any, any>>,
>(
  apiGenerators: TApi,
  reducer: QpqBubbleReducer<TState, TAction> = (s) => [s, false],
  initialState: TState = {} as TState,
): [MappedApi<TApi>, TState, (action: any) => void] {
  const [state, dispatch, getCurrentState] = useBubblingReducer(reducer, initialState);

  // Api generators are memoized to prevent unnecessary re-renders.
  const [memoedApiGenerators] = useState(() => apiGenerators);
  const resolver = useQpq(getStateActionProcessor(dispatch, getCurrentState));

  // Wrap and remap each API generator using the resolver.
  const api = useMemo(() => {
    console.log('new api');
    const wrapped = {} as MappedApi<TApi>;
    for (const key in memoedApiGenerators) {
      if (Object.prototype.hasOwnProperty.call(memoedApiGenerators, key)) {
        // Remove the 'ask' prefix and lower-case the first character.
        const withoutAsk = key.slice(3); // e.g., "FetchTodos"
        const newKey = withoutAsk.charAt(0).toLowerCase() + withoutAsk.slice(1); // "fetchTodos"
        // We know newKey matches our mapped type so we can assign.
        // (A type assertion is used here to quiet the compiler.)
        wrapped[newKey as RemoveAskPrefix<typeof key>] = resolver(memoedApiGenerators[key as any]) as any;
      }
    }
    return wrapped;
  }, [resolver, memoedApiGenerators]);

  return [api, state, dispatch];
}
