import { WebsocketService, WebsocketServiceEvent } from 'quidproquo-web';
import { AnyWebSocketQueueEventMessageWithCorrelation, WebSocketQueueServerMessageEventType } from 'quidproquo-webserver';
import { WebSocketQueueServerEventMessageServiceRequestResponse } from 'quidproquo-webserver/lib/commonjs/services/webSocketQueue/types/serverMessages/WebSocketQueueServerEventMessageServiceRequestResponse';

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
  const pendingResolversRef = useRef<Map<string, (payload: any) => void>>(new Map());

  // Subscribe to ALL messages, filter by active correlationIds
  const handleMessage = useFastCallback((_ws: WebsocketService, rawEvent?: Event) => {
    if (!rawEvent) return;

    try {
      const parsed: AnyWebSocketQueueEventMessageWithCorrelation = JSON.parse((rawEvent as MessageEvent).data);
      if (!parsed.correlationId || !activeCorrelationsRef.current.has(parsed.correlationId)) {
        return;
      }

      if (parsed.type === WebSocketQueueServerMessageEventType.ServiceRequestResponse) {
        const resolve = pendingResolversRef.current.get(parsed.correlationId);
        if (resolve) {
          resolve((parsed as WebSocketQueueServerEventMessageServiceRequestResponse).payload);
          
          pendingResolversRef.current.delete(parsed.correlationId);
          activeCorrelationsRef.current.delete(parsed.correlationId);
        }
      } else {
        onCorrelatedMessage?.(parsed);
      }
    } catch {
      // Not JSON or not a queue message — ignore
    }
  });

  useSubscribeToWebsocket(WebsocketServiceEvent.MESSAGE, handleMessage);

  // Send with auto-generated correlationId, register it as active
  const sendEvent = useFastCallback((event: Omit<TSend, 'correlationId'>): Promise<any> => {
    if (!websocketApi) {
      return Promise.resolve(undefined);
    }

    const correlationId = crypto.randomUUID();
    activeCorrelationsRef.current.add(correlationId);

    const isServiceRequest = event.type.startsWith('qpq/serviceRequest/');

    if (isServiceRequest) {
      const promise = new Promise<any>((resolve) => {
        pendingResolversRef.current.set(correlationId, resolve);
      });

      websocketApi.sendEvent({ ...event, correlationId } as TSend);

      return promise;
    }

    websocketApi.sendEvent({ ...event, correlationId } as TSend);

    return Promise.resolve(undefined);
  });

  return sendEvent;
};
