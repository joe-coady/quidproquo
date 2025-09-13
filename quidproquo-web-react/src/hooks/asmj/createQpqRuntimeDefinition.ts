import { useCallback, useMemo } from 'react';
import { atom, useAtom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { QpqBubbleReducer } from './bubbleReducer';
import { QpqApi } from './QpqMappedApi';

// Define the function type for retrieving atoms
type CustomJotaiReducerAtom<TState> = ReturnType<typeof atom<TState>>;
type CustomJotaiComputedAtom<TState, TSlice> = ReturnType<typeof selectAtom<TState, TSlice>>;

export type QpqAsmjState<TState, TAction, TApi extends QpqApi> = {
  atom: CustomJotaiReducerAtom<TState>;
  reducer: QpqBubbleReducer<TState, TAction>;
  initialState: TState;
  api: TApi;
  state: TState;
};
type AsmjStateGetter<TState, TAction, TApi extends QpqApi> = (name?: string) => QpqAsmjState<TState, TAction, TApi>;
type AsmjStateComputer<TState, TSlice> = (name?: string) => CustomJotaiComputedAtom<TState, TSlice>;

export type QpqRuntimeDefinition<TState, TAction, TApi extends QpqApi> = AsmjStateGetter<TState, TAction, TApi>;
export type QpqRuntimeComputed<TState, TSlice> = AsmjStateComputer<TState, TSlice>;

export function createQpqRuntimeDefinition<TState, TAction, TApi extends QpqApi>(
  api: TApi,
  initialState: TState,
  reducer: QpqBubbleReducer<TState, TAction> = (s) => [s, false],
): QpqRuntimeDefinition<TState, TAction, TApi> {
  const namedAtoms = new Map<string, QpqAsmjState<TState, TAction, TApi>>();

  const getCustomNamedAtom: AsmjStateGetter<TState, TAction, TApi> = (name?: string): QpqAsmjState<TState, TAction, TApi> => {
    const actualName = name ? name : '$$qpq-default$$';
    if (!namedAtoms.has(actualName)) {
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

export function createQpqRuntimeComputed<TState, TAction, TApi extends QpqApi, TSlice>(
  atom: QpqRuntimeDefinition<TState, TAction, TApi>,
  compute: (state: TState) => TSlice,
): QpqRuntimeComputed<TState, TSlice> {
  return (name?: string): CustomJotaiComputedAtom<TState, TSlice> => {
    const info = atom(name);
    return selectAtom(info.atom, compute);
  };
}

export function useQpqRuntimeState<TState, TAction, TApi extends QpqApi>(
  atom: QpqRuntimeDefinition<TState, TAction, TApi>,
  name?: string,
): [TState, (newState: TState) => void, () => TState] {
  const actualAtom = useMemo(() => atom(name).atom, [atom, name]);

  const [state, setState] = useAtom(actualAtom);

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
  }, [atom, name]);

  return [state, setStateWrapper, getState];
}

export function useQpqRuntimeComputed<TState, TSlice>(computedAtom: QpqRuntimeComputed<TState, TSlice>, name?: string): TSlice {
  const computedAtomValue = useMemo(() => computedAtom(name), [computedAtom, name]);

  const [state] = useAtom(computedAtomValue);

  return state;
}
