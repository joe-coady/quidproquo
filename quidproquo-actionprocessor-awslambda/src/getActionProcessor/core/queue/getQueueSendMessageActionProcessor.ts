import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils, QueueMessage, StorySession } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QueueActionType,
  QueueSendMessageActionProcessor,
  QueueSendMessagesErrorTypeEnum,
  toCrossServiceSession,
} from 'quidproquo-core';

import { sendMessages } from '../../../logic/sqs/sendMessages';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;
};

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages }, session) => {
    // While we have some uuids
    const sqsQueueName = resolveResourceName(queueName, qpqConfig);

    try {
      await sendMessages(
        sqsQueueName,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        queueMessages.map((message) => {
          // Add the session info to the message
          const queueMessageWithSession: AnyQueueMessageWithSession = {
            ...message,
            storySession: toCrossServiceSession(session),
          };

          return JSON.stringify(queueMessageWithSession);
        }),
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AccessDenied: () => actionResultError(QueueSendMessagesErrorTypeEnum.AccessDenied, 'Access denied sending to queue'),
        AccessDeniedException: () => actionResultError(QueueSendMessagesErrorTypeEnum.AccessDenied, 'Access denied sending to queue'),
        QueueDoesNotExist: () => actionResultError(QueueSendMessagesErrorTypeEnum.QueueNotFound, `Queue not found: ${queueName}`),
        RequestThrottled: () => actionResultError(QueueSendMessagesErrorTypeEnum.ServiceUnavailable, 'Queue throttled'),
      });
    }
  };
};

export const getQueueSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueueActionType.SendMessages]: getProcessQueueSendMessage(qpqConfig),
});
