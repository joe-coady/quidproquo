import { createContext, memo, ReactNode, useCallback, useContext, useRef, useState } from 'react';

// Define the bubble reducer type
export type QpqBubbleReducer<S, A> = (prevState: S, action: A) => [S, boolean];

// Create a context with a default NOOP dispatcher
const BubbleReducerDispatchContext = createContext<(action: any) => void>((_action: any): void => {
  // NOOP
});

export const useBubblingReducer = <TState, TAction>(
  reducer: QpqBubbleReducer<TState, TAction>,
  initialState: TState,
): [TState, (action: TAction) => void, () => TState] => {
  const ref = useRef(initialState);

  // Use useState so we can leverage functional updates
  const [state, setState] = useState(ref.current);

  // Get the parent dispatch from the context
  const parentDispatch = useContext(BubbleReducerDispatchContext);

  // Custom Dispatch using functional updates
  const dispatch = useCallback((action: TAction): void => {
    const [newState, preventBubble] = reducer(ref.current, action);

    if (preventBubble) {
      // If the action was handled, update state
      ref.current = newState;
      setState(newState);
    } else {
      parentDispatch(action);
    }
  }, []);

  const getState = useCallback((): TState => ref.current, []);

  return [state, dispatch, getState];
};

export const BubbleReducerDispatchProviderComponent = ({ children, dispatch }: { children: ReactNode; dispatch: (action: any) => void }) => (
  <BubbleReducerDispatchContext.Provider value={dispatch}>{children}</BubbleReducerDispatchContext.Provider>
);

export const BubbleReducerDispatchProvider = memo(BubbleReducerDispatchProviderComponent);
