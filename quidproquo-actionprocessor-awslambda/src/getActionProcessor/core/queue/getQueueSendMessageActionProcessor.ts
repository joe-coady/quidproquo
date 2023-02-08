import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';
import { QueueSendMessageActionProcessor, actionResult, QueueActionType } from 'quidproquo-core';
import { sendMessage } from '../../../logic/sqs/sendMessage';

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, type, payload }) => {
    const sqsQueueName = resolveResourceName(queueName, qpqConfig);
    await sendMessage(
      sqsQueueName,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      JSON.stringify({ type, payload }),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [QueueActionType.SendMessage]: getProcessQueueSendMessage(qpqConfig),
});
