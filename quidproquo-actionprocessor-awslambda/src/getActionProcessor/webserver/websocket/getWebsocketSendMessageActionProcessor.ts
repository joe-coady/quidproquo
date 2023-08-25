import { actionResult, QPQConfig, qpqCoreUtils } from 'quidproquo-core';


import { WebsocketSendMessageActionProcessor, WebsocketActionType } from 'quidproquo-webserver';

import { getCFExportNameWebsocketApiIdFromConfig } from '../../../awsNamingUtils';

import { sendMessageToWebSocketConnection } from '../../../logic/apiGateway/websocketSendMessage';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getWebsocketSendMessageActionProcessor = (
  qpqConfig: QPQConfig,
): WebsocketSendMessageActionProcessor<any> => {
  return async ({ connectionId, payload, websocketApiName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const apiId = await getExportedValue(
        getCFExportNameWebsocketApiIdFromConfig(websocketApiName, qpqConfig),
        region,
    );

    await sendMessageToWebSocketConnection(apiId, connectionId, region, payload);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [WebsocketActionType.SendMessage]: getWebsocketSendMessageActionProcessor(qpqConfig),
  };
};

