import { actionResult, actionResultError, actionResultErrorFromCaughtError, QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { WebsocketSendMessageActionProcessor, WebsocketActionType, WebsocketSendMessageErrorTypeEnum } from 'quidproquo-webserver';

import { getCFExportNameWebsocketApiIdFromConfig } from '../../../awsNamingUtils';

import { sendMessageToWebSocketConnection } from '../../../logic/apiGateway/websocketSendMessage';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getWebsocketSendMessageActionProcessor = (qpqConfig: QPQConfig): WebsocketSendMessageActionProcessor<any> => {
  return async ({ connectionId, payload, websocketApiName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const apiId = await getExportedValue(getCFExportNameWebsocketApiIdFromConfig(websocketApiName, qpqConfig), region);

    try {
      await sendMessageToWebSocketConnection(apiId, connectionId, region, payload);

      return actionResult(void 0);
    } catch (error) {
      return actionResultErrorFromCaughtError(error, {
        ThrottlingException: () => actionResultError(WebsocketSendMessageErrorTypeEnum.Throttled, 'Rate exceeded'),
        GoneException: () => actionResultError(WebsocketSendMessageErrorTypeEnum.Disconnected, 'Connection no longer exists'),
      });
    }
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [WebsocketActionType.SendMessage]: getWebsocketSendMessageActionProcessor(qpqConfig),
  };
};
