import { ErrorTypeEnum, EventActionType, EventMatchStoryActionProcessor, QPQConfig, actionResult, actionResultError } from 'quidproquo-core';
import { GLOBAL_WEBSOCKET_API_NAME, InternalEventRecord, MatchResult } from './types';
import { RouteQPQWebServerConfigSetting, WebSocketEventType, qpqWebServerUtils } from 'quidproquo-webserver';

import { matchUrl } from '../../../../../awsLambdaUtils';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const userDirectoryConfig = qpqWebServerUtils.getWebsocketEntryByApiName(GLOBAL_WEBSOCKET_API_NAME, qpqConfig);

  return async ({ qpqEventRecord }) => {
    switch (qpqEventRecord.eventType) {
      case WebSocketEventType.Connect:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onConnect.src,
          runtime: userDirectoryConfig.eventProcessors.onConnect.runtime,
        });
      case WebSocketEventType.Disconnect:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onDisconnect.src,
          runtime: userDirectoryConfig.eventProcessors.onDisconnect.runtime,
        });
      case WebSocketEventType.Message:
        return actionResult<MatchResult>({
          src: userDirectoryConfig.eventProcessors.onMessage.src,
          runtime: userDirectoryConfig.eventProcessors.onMessage.runtime,
        });
      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Websocket lambda not implemented for ${qpqEventRecord.eventType}`);
    }
  };
};
export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
