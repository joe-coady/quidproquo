import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { QueueSendMessageActionProcessor, actionResult, QueueActionType } from 'quidproquo-core';
import { sendMessages } from '../../../logic/sqs/sendMessages';

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages }) => {
    // While we have some uuids
    const sqsQueueName = resolveResourceName(queueName, qpqConfig);
    await sendMessages(
      sqsQueueName,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      queueMessages.map((message) => JSON.stringify(message)),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [QueueActionType.SendMessages]: getProcessQueueSendMessage(qpqConfig),
});
