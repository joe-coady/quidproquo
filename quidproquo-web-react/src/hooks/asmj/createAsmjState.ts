import { atom, useAtom } from 'jotai';

import { QpqBubbleReducer } from '../useBubbleReducer';
import { QpqApi } from './QpqMappedApi';

// Define the function type for retrieving atoms
type CustomJotaiReducerAtom<TState> = ReturnType<typeof atom<TState>>;
export type QpqAsmjState<TState, TAction, TApi extends QpqApi> = {
  atom: CustomJotaiReducerAtom<TState>;
  reducer: QpqBubbleReducer<TState, TAction>;
  initialState: TState;
  api: TApi;
};
type AsmjStateGetter<TState, TAction, TApi extends QpqApi> = (name?: string) => QpqAsmjState<TState, TAction, TApi>;

export type AsmjAtom<TState, TAction, TApi extends QpqApi> = AsmjStateGetter<TState, TAction, TApi>;

export function createAsmjState<TState, TAction, TApi extends QpqApi>(
  api: TApi,
  initialState: TState,
  reducer: QpqBubbleReducer<TState, TAction> = (s) => [s, false],
): AsmjAtom<TState, TAction, TApi> {
  const namedAtoms = new Map<string, CustomJotaiReducerAtom<TState>>();

  const getCustomNamedAtom: AsmjStateGetter<TState, TAction, TApi> = (name?: string): QpqAsmjState<TState, TAction, TApi> => {
    const actualName = name ? name : '$$qpq-default$$';
    if (!namedAtoms.has(actualName)) {
      console.log('Creating Atom: ', actualName);
      namedAtoms.set(actualName, atom(initialState));
    }

    return {
      atom: namedAtoms.get(actualName)!,
      reducer,
      initialState,
      api: api,
    };
  };

  return getCustomNamedAtom;
}

export function useAsmjState<TState, TAction, TApi extends QpqApi>(
  atom: AsmjAtom<TState, TAction, TApi>,
  name?: string,
): [TState, (newState: TState) => void] {
  const [state, setState] = useAtom(atom(name).atom);

  return [state, setState];
}
