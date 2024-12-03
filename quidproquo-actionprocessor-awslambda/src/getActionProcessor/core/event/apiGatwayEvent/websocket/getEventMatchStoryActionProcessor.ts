import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils, WebSocketEventType } from 'quidproquo-webserver';

import { EventInput, GLOBAL_WEBSOCKET_API_NAME, InternalEventRecord, MatchResult } from './types';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult, EventInput> => {
  const userDirectoryConfig = qpqWebServerUtils.getWebsocketEntryByApiName(GLOBAL_WEBSOCKET_API_NAME, qpqConfig);

  return async ({ qpqEventRecord }) => {
    switch (qpqEventRecord.eventType) {
      case WebSocketEventType.Connect:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig.eventProcessors.onConnect,
        });
      case WebSocketEventType.Disconnect:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig.eventProcessors.onDisconnect,
        });
      case WebSocketEventType.Message:
        return actionResult<MatchResult>({
          runtime: userDirectoryConfig.eventProcessors.onMessage,
        });
      default:
        return actionResultError(ErrorTypeEnum.NotFound, `Websocket lambda not implemented for ${qpqEventRecord.eventType}`);
    }
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
