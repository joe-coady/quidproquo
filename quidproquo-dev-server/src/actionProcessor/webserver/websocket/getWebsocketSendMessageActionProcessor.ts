import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { qpqWebServerUtils, WebsocketActionType, WebsocketSendMessageActionProcessor, WebsocketSendMessageErrorTypeEnum } from 'quidproquo-webserver';

// The connection REGISTRY, not the implementation: webSocketImplementation imports
// the event-processing pipeline (which includes these processors), so importing it
// here would close an import cycle. The registry is a leaf holding the live
// connections both sides share.
import { sendMessageToWebSocketConnection } from '../../../implementations/webSocket/webSocketConnectionRegistry';

const getProcessSendMessage = (qpqConfig: QPQConfig): WebsocketSendMessageActionProcessor<any> => {
  return async ({ connectionId, payload, websocketApiName }) => {
    const websocketConfig = qpqWebServerUtils.getWebsocketEntryByApiName(websocketApiName, qpqConfig);
    const service = websocketConfig.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig);

    try {
      await sendMessageToWebSocketConnection(service, websocketApiName, connectionId, payload);

      return actionResult(void 0);
    } catch (error) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getWebsocketSendMessageActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [WebsocketActionType.SendMessage]: getProcessSendMessage(qpqConfig),
});
