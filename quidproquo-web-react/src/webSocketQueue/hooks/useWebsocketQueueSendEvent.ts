import { WebsocketService, WebsocketServiceEvent } from 'quidproquo-web';
import { AnyWebSocketQueueEventMessageWithCorrelation } from 'quidproquo-webserver';

import { useRef } from 'react';

import { useFastCallback } from '../../hooks';
import { useSubscribeToWebsocket, useWebsocketApi } from '../../websocket';

export const useWebsocketQueueSendEvent = <
  TSend extends AnyWebSocketQueueEventMessageWithCorrelation,
>(
  onCorrelatedMessage?: (event: AnyWebSocketQueueEventMessageWithCorrelation) => void,
) => {
  const websocketApi = useWebsocketApi();
  const activeCorrelationsRef = useRef<Set<string>>(new Set());

  // Subscribe to ALL messages, filter by active correlationIds
  const handleMessage = useFastCallback((_ws: WebsocketService, rawEvent?: Event) => {
    if (!onCorrelatedMessage || !rawEvent) return;
    try {
      const parsed: AnyWebSocketQueueEventMessageWithCorrelation = JSON.parse((rawEvent as MessageEvent).data);
      if (parsed.correlationId && activeCorrelationsRef.current.has(parsed.correlationId)) {
        onCorrelatedMessage(parsed);
      }
    } catch {
      // Not JSON or not a queue message — ignore
    }
  });

  useSubscribeToWebsocket(WebsocketServiceEvent.MESSAGE, handleMessage);

  // Send with auto-generated correlationId, register it as active
  const sendEvent = useFastCallback((event: Omit<TSend, 'correlationId'>) => {
    if (websocketApi) {
      const correlationId = crypto.randomUUID();
      activeCorrelationsRef.current.add(correlationId);
      websocketApi.sendEvent({ ...event, correlationId } as TSend);
    }
  });

  return sendEvent;
};
