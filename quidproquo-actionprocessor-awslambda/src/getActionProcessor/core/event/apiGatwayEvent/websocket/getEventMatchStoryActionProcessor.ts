import {
  ActionProcessorList,
  ActionProcessorListResolver,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  actionResult,
  actionResultError,
} from 'quidproquo-core';
import { GLOBAL_WEBSOCKET_API_NAME, InternalEventRecord, MatchResult } from './types';
import { WebSocketEventType, qpqWebServerUtils } from 'quidproquo-webserver';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
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
