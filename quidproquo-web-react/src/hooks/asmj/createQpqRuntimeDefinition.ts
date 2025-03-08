import { useCallback } from 'react';
import { atom, useAtom } from 'jotai';

import { QpqApi } from './QpqMappedApi';
import { QpqBubbleReducer } from './QpqRuntimeEffectCatcher';

// Define the function type for retrieving atoms
type CustomJotaiReducerAtom<TState> = ReturnType<typeof atom<TState>>;
export type QpqAsmjState<TState, TAction, TApi extends QpqApi> = {
  atom: CustomJotaiReducerAtom<TState>;
  reducer: QpqBubbleReducer<TState, TAction>;
  initialState: TState;
  api: TApi;
  state: TState;
};
type AsmjStateGetter<TState, TAction, TApi extends QpqApi> = (name?: string) => QpqAsmjState<TState, TAction, TApi>;

export type QpqRuntimeDefinition<TState, TAction, TApi extends QpqApi> = AsmjStateGetter<TState, TAction, TApi>;

export function createQpqRuntimeDefinition<TState, TAction, TApi extends QpqApi>(
  api: TApi,
  initialState: TState,
  reducer: QpqBubbleReducer<TState, TAction> = (s) => [s, false],
): QpqRuntimeDefinition<TState, TAction, TApi> {
  const namedAtoms = new Map<string, QpqAsmjState<TState, TAction, TApi>>();

  const getCustomNamedAtom: AsmjStateGetter<TState, TAction, TApi> = (name?: string): QpqAsmjState<TState, TAction, TApi> => {
    const actualName = name ? name : '$$qpq-default$$';
    if (!namedAtoms.has(actualName)) {
      console.log('Creating Atom: ', actualName);

      const winAtom: QpqAsmjState<TState, TAction, TApi> = {
        atom: atom(initialState),
        reducer,
        initialState,
        api: api,
        state: initialState,
      };

      namedAtoms.set(actualName, winAtom);
    }

    return namedAtoms.get(actualName)!;
  };

  return getCustomNamedAtom;
}

export function useQpqRuntimeState<TState, TAction, TApi extends QpqApi>(
  atom: QpqRuntimeDefinition<TState, TAction, TApi>,
  name?: string,
): [TState, (newState: TState) => void, () => TState] {
  const [state, setState] = useAtom(atom(name).atom);

  const setStateWrapper = useCallback(
    (newState: TState) => {
      const info = atom(name);
      info.state = newState;

      setState(newState);
    },
    [setState],
  );

  const getState = useCallback((): TState => {
    const state = atom(name).state;
    return state;
  }, [atom]);

  return [state, setStateWrapper, getState];
}
