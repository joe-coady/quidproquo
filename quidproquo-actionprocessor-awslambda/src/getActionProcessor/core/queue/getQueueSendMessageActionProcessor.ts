import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils, QueueMessage, StorySession } from 'quidproquo-core';
import { actionResult, QueueActionType, QueueSendMessageActionProcessor } from 'quidproquo-core';

import { sendMessages } from '../../../logic/sqs/sendMessages';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;
};

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages, context }, session) => {
    // While we have some uuids
    const sqsQueueName = resolveResourceName(queueName, qpqConfig);
    await sendMessages(
      sqsQueueName,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
      queueMessages.map((message) => {
        // Add the session info to the message
        const queueMessageWithSession: AnyQueueMessageWithSession = {
          ...message,
          storySession: {
            ...session,
            context,
          },
        };

        return JSON.stringify(queueMessageWithSession);
      }),
    );

    return actionResult(void 0);
  };
};

export const getQueueSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueueActionType.SendMessages]: getProcessQueueSendMessage(qpqConfig),
});
