import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import {
  WebSocketEventType, 
  WebsocketEvent, 
  WebsocketEventResponse, 
  qpqWebServerUtils,
} from 'quidproquo-webserver';

import { APIGatewayEventWebsocketRequestContextV2, APIGatewayProxyWebsocketEventV2WithRequestContext, Context } from 'aws-lambda';

type ApiGatwayEventWebsocketWithIdentity = APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2 & { identity: { sourceIp: string; userAgent: string; } }>;

type EventInput = [ApiGatwayEventWebsocketWithIdentity, Context];
type EventOutput = { statusCode: number };

// Internals
type InternalEventInput = WebsocketEvent<string | Blob | ArrayBuffer>;
type InternalEventOutput = WebsocketEventResponse;

type AutoRespondResult = boolean;
type MatchResult = MatchStoryResult<any, any>;

// TODO: Don't use Globals like this
const GLOBAL_WEBSOCKET_API_NAME = process.env.websocketApiName!;

const awsToQoqEventTypeMap = {
  "MESSAGE": WebSocketEventType.Message,
  "CONNECT": WebSocketEventType.Connect,
  "DISCONNECT": WebSocketEventType.Disconnect,
}

const getProcessTransformEventParams = (): EventTransformEventParamsActionProcessor<EventInput, InternalEventInput> => {

  return async ({ eventParams: [websocketEvent, context] }) => {
    const transformedEventParams: InternalEventInput = {
      eventType: awsToQoqEventTypeMap[websocketEvent.requestContext.eventType],

      messageId: websocketEvent.requestContext.messageId,
      connectionId: websocketEvent.requestContext.connectionId,
      requestTimeEpoch: websocketEvent.requestContext.requestTimeEpoch,
      sourceIp: websocketEvent.requestContext.identity.sourceIp,
      userAgent: websocketEvent.requestContext.identity.userAgent,
      requestTime: new Date(websocketEvent.requestContext.requestTimeEpoch).toISOString(),
      body: (websocketEvent.body as (string | Blob | ArrayBuffer | undefined))
    };

    return actionResult(transformedEventParams);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  InternalEventOutput,
  InternalEventInput,
  EventOutput
> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    // always success
    return actionResult<EventOutput>({
      statusCode: 200,
    });
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<
  InternalEventInput,
  MatchResult,
  AutoRespondResult
> => {
  return async (payload) => {
    // always allow
    return actionResult(false);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  const userDirectoryConfig = qpqWebServerUtils.getWebsocketEntryByApiName(GLOBAL_WEBSOCKET_API_NAME, qpqConfig);

  return async (payload) => {
    switch (payload.transformedEventParams.eventType) {
      case WebSocketEventType.Connect:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onConnect.src,
          runtime: userDirectoryConfig.eventProcessors.onConnect.runtime
        });
      case WebSocketEventType.Disconnect:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onDisconnect.src,
          runtime: userDirectoryConfig.eventProcessors.onDisconnect.runtime
        });
      case WebSocketEventType.Message:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onMessage.src,
          runtime: userDirectoryConfig.eventProcessors.onMessage.runtime
        });
      default:
        return actionResultError(
          ErrorTypeEnum.NotFound,
          `Websocket lambda not implemented for ${payload.transformedEventParams.eventType}`,
        );
    }
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
