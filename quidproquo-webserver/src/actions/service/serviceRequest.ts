import {
  AskResponse,
  QueueEvent,
  QueueEventResponse,
  QueueMessage,
} from 'quidproquo-core';

import { askWebsocketReadConnectionInfo } from '../../context';
import { askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend } from '../../services/webSocketQueue/logic/webSocket/askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend';
import { WebSocketQueueServerEventMessageServiceRequestResponse } from '../../services/webSocketQueue/types/serverMessages/WebSocketQueueServerEventMessageServiceRequestResponse';
import { WebSocketQueueServerMessageEventType } from '../../services/webSocketQueue/types/serverMessages/WebSocketQueueServerMessageEventType';
import { ServiceRequester } from './createServiceRequester';

type PayloadOf<R> = R extends ServiceRequester<infer T, any> ? T : never;
type ResponseOf<R> = R extends ServiceRequester<any, infer T> ? T : never;

export const serviceRequest = <R extends ServiceRequester<any, any>>(
  requester: R,
  runtime: (payload: PayloadOf<R>) => AskResponse<ResponseOf<R>>
) => {
  const { method } = requester.serviceRequest;

  const wrapper = function* wrapper(event: QueueEvent<QueueMessage<any>>) {
    const result = yield* runtime(event.message.payload);

    const { connectionId, correlationId } =
      yield* askWebsocketReadConnectionInfo();

    const response: WebSocketQueueServerEventMessageServiceRequestResponse = {
      type: WebSocketQueueServerMessageEventType.ServiceRequestResponse,
      payload: result,
    };

    yield* askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(
      { ...response, correlationId },
      connectionId,
    );

    return true as QueueEventResponse;
  };

  wrapper.serviceRequest = { method };

  return wrapper;
};
