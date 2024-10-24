import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
} from 'quidproquo-core';
import { WebsocketActionType, WebsocketSendMessageActionProcessor, WebsocketSendMessageErrorTypeEnum } from 'quidproquo-webserver';

import { getCFExportNameWebsocketApiIdFromConfig } from '../../../awsNamingUtils';
import { sendMessageToWebSocketConnection } from '../../../logic/apiGateway/websocketSendMessage';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getProcessSendMessage = (qpqConfig: QPQConfig): WebsocketSendMessageActionProcessor<any> => {
  return async ({ connectionId, payload, websocketApiName }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

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

export const getWebsocketSendMessageActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [WebsocketActionType.SendMessage]: getProcessSendMessage(qpqConfig),
});
