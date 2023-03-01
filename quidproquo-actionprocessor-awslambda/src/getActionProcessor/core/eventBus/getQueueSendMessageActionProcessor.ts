import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import {
  EventBusSendMessageActionProcessor,
  actionResult,
  EventBusActionType,
} from 'quidproquo-core';
import { publishMessage } from '../../../logic/sns/publishMessage';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getCFExportNameSnsTopicArnFromConfig } from '../../../awsNamingUtils';

const getProcessEventBusSendMessage = (
  qpqConfig: QPQConfig,
): EventBusSendMessageActionProcessor<any> => {
  return async ({ eventBusName, eventBusMessages }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const topicArn = await getExportedValue(
      getCFExportNameSnsTopicArnFromConfig(eventBusName, qpqConfig),
      region,
    );

    await publishMessage(
      topicArn,
      region,
      eventBusMessages.map((message) => JSON.stringify(message)),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [EventBusActionType.SendMessages]: getProcessEventBusSendMessage(qpqConfig),
});
