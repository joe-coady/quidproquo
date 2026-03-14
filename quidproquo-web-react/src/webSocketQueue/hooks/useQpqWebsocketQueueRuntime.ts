 
import { Story } from 'quidproquo-core';
import { AnyWebSocketQueueEventMessageWithCorrelation, WebSocketQueueServerMessageEventType } from 'quidproquo-webserver';

import { useRef } from 'react';

import { QpqRuntimeDefinition } from '../../hooks/asmj/createQpqRuntimeDefinition';
import { QpqApi, QpqMappedApi } from '../../hooks/asmj/QpqMappedApi';
import { ActionProcessorListResolverFactory, useQpqRuntime } from '../../hooks/asmj/useQpqRuntime';
import { getServiceRequestActionProcessor } from './actionProcessor/getServiceRequestActionProcessor';
import { useWebsocketQueueSendEvent } from './useWebsocketQueueSendEvent';

export function useQpqWebsocketQueueRuntime<
  TState,
  TAction,
  TApi extends QpqApi,
>(
  atom: QpqRuntimeDefinition<TState, TAction, TApi>,
  mainStory?: Story<any, any>,
  name?: string,
  getActionProcessors?: ActionProcessorListResolverFactory<TState>,
): [QpqMappedApi<TApi>, TState, (action: any) => void, (event: Omit<AnyWebSocketQueueEventMessageWithCorrelation, 'correlationId'>) => void] {
  const sendEventRef = useRef<((event: Omit<AnyWebSocketQueueEventMessageWithCorrelation, 'correlationId'>) => void) | null>(null);

  const mergedFactory: ActionProcessorListResolverFactory<TState> = (dispatch, getCurrentState) => {
    const serviceResolver = async () => getServiceRequestActionProcessor(sendEventRef);
    const callerResolver = getActionProcessors?.(dispatch, getCurrentState);

    return async (qpqConfig, dynamicModuleLoader) => ({
      ...(await serviceResolver()),
      ...(callerResolver ? await callerResolver(qpqConfig, dynamicModuleLoader) : {}),
    });
  };

  const [api, state, dispatch] = useQpqRuntime(atom, mainStory, name, mergedFactory);

  const sendEvent = useWebsocketQueueSendEvent((event) => {
    if (event.type === WebSocketQueueServerMessageEventType.StateDispatch) {
      dispatch((event as any).payload);
    }
  });

  sendEventRef.current = sendEvent;

  return [api, state, dispatch, sendEvent];
}
