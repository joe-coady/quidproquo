import { memo, ReactNode } from 'react';

import { BubbleReducerDispatchContext } from './bubbleReducer';
import { QpqRuntimeDefinition } from './createQpqRuntimeDefinition';
import { QpqApi } from './QpqMappedApi';
import { useQpqRuntime } from './useQpqRuntime';


type QpqRuntimeEffectCatcher = {
  runtime: QpqRuntimeDefinition<any, any, any>;
  name?: string;
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
