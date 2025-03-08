import { createContext, memo, ReactNode, useContext } from 'react';

import { QpqApi } from './asmj/QpqMappedApi';
import { AsmjAtom, useAsmjState } from './asmj';
import { useFastCallback } from './useFastCallback';

// Define the bubble reducer type
export type QpqBubbleReducer<S, A> = (prevState: S, action: A) => [S, boolean];

// Create a context with a default NOOP dispatcher
const BubbleReducerDispatchContext = createContext<(action: any) => void>((_action: any): void => {
  // NOOP
});

export const useBubblingReducer = <TState, TAction, TApi extends QpqApi>(
  atom: AsmjAtom<TState, TAction, TApi>,
  name?: string,
): [TState, (action: TAction) => void, () => TState] => {
  const atomInfo = atom(name);
  const [state, setState] = useAsmjState(atom, name);

  // Get the parent dispatch from the context
  const parentDispatch = useContext(BubbleReducerDispatchContext);

  // Custom Dispatch using functional updates
  const dispatch = useFastCallback((action: TAction): void => {
    const [newState, preventBubble] = atomInfo.reducer(state, action);

    if (preventBubble) {
      setState(newState);
    } else {
      parentDispatch(action);
    }
  });

  const getState = useFastCallback((): TState => state);

  return [state, dispatch, getState];
};

export const BubbleReducerDispatchProviderComponent = ({ children, dispatch }: { children: ReactNode; dispatch: (action: any) => void }) => (
  <BubbleReducerDispatchContext.Provider value={dispatch}>{children}</BubbleReducerDispatchContext.Provider>
);

export const BubbleReducerDispatchProvider = memo(BubbleReducerDispatchProviderComponent);
