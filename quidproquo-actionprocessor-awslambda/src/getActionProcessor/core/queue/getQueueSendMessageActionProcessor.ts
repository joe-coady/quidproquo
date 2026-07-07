import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, qpqCoreUtils, QueueMessage, StorySession } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  generateUuid,
  QueueActionType,
  QueueSendMessageActionProcessor,
  QueueSendMessagesErrorTypeEnum,
  toCrossServiceSession,
} from 'quidproquo-core';

import { getQueueRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';
import { sendMessages, SqsQueueMessageEntry } from '../../../logic/sqs/sendMessages';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;
};

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages }, session) => {
    // While we have some uuids
    const sqsQueueName = getQueueRuntimeResourceNameFromConfig(queueName, qpqConfig);
    const isFifo = qpqCoreUtils.getQueueByName(qpqConfig, queueName)?.isFifo || false;

    try {
      await sendMessages(
        sqsQueueName,
        qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
        queueMessages.map((message): SqsQueueMessageEntry => {
          // Add the session info to the message
          const queueMessageWithSession: AnyQueueMessageWithSession = {
            ...message,
            storySession: toCrossServiceSession(session),
          };

          return {
            body: JSON.stringify(queueMessageWithSession),

            // FIFO: default to one group per queue (global ordering) and a unique
            // dedup id (no dedup) - callers opt in to per-entity groups / real dedup
            ...(isFifo
              ? {
                  groupId: message.groupId ?? queueName,
                  deduplicationId: message.deduplicationId ?? generateUuid(),
                }
              : {}),
          };
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
