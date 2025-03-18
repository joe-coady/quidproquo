import { createContext, memo, ReactNode, useContext, useMemo } from 'react';

import { useFastCallback } from '../useFastCallback';
import { QpqApi } from './QpqMappedApi';
import { QpqRuntimeDefinition, useQpqRuntime, useQpqRuntimeState } from '.';

// Define the bubble reducer type
export type QpqBubbleReducer<S, A> = (prevState: S, action: A) => [S, boolean];

type QpqRuntimeEffectCatcher = {
  runtime: QpqRuntimeDefinition<any, any, any>;
  name?: string;
};

// Create a context with a default NOOP dispatcher
const BubbleReducerDispatchContext = createContext<(action: any) => void>((_action: any): void => {
  // NOOP
});

export const useQpqRuntimeBubblingReducer = <TState, TAction, TApi extends QpqApi>(
  runtimeDefinition: QpqRuntimeDefinition<TState, TAction, TApi>,
  name?: string,
): [TState, (action: TAction) => void, () => TState] => {
  const runtimeDefinitionInfo = useMemo(() => runtimeDefinition(name), [runtimeDefinition, name]);

  const [state, setState, getState] = useQpqRuntimeState(runtimeDefinition, name);

  // Get the parent dispatch from the context
  const parentDispatch = useContext(BubbleReducerDispatchContext);

  // Custom Dispatch using functional updates
  const dispatch = useFastCallback((action: TAction): void => {
    const [newState, preventBubble] = runtimeDefinitionInfo.reducer(getState(), action);

    if (preventBubble) {
      setState(newState);
    } else {
      parentDispatch(action);
    }
  });

  return [state, dispatch, getState];
};

export const QpqRuntimeEffectCatcherComponent = <TState, TAction, TApi extends QpqApi>({
  children,
  runtime,
  name,
}: QpqRuntimeEffectCatcher & {
  children: ReactNode;
}) => {
  const [api, state, dispatch] = useQpqRuntime(runtime, undefined, name);

  return <BubbleReducerDispatchContext.Provider value={dispatch}>{children}</BubbleReducerDispatchContext.Provider>;
};

export const QpqRuntimeEffectCatcher = memo(QpqRuntimeEffectCatcherComponent);
