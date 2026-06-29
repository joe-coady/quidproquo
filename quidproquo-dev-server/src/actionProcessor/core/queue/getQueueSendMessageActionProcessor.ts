import { ActionProcessorList, ActionProcessorListResolver, actionResultError, ErrorTypeEnum, generateUuid, QPQConfig, qpqCoreUtils, toCrossServiceSession } from 'quidproquo-core';
import { actionResult, QueueActionType, QueueSendMessageActionProcessor } from 'quidproquo-core';

import { eventBus } from '../../../logic/eventBus';
import { AnyQueueMessageWithSession } from '../event/queue/types';

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages }, session) => {
    const queueConfig = qpqCoreUtils.getQueueByName(qpqConfig, queueName);
    if (!queueConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Queue ${queueName} not found`);
    }

    for (const queueMessage of queueMessages) {
      const queueEvent: AnyQueueMessageWithSession = {
        payload: queueMessage.payload,
        type: queueMessage.type,

        storySession: toCrossServiceSession(session),

        messageId: generateUuid(),
        queueName: queueName,

        targetApplication: queueConfig.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig),
        targetEnvironment: queueConfig.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
        targetFeature: queueConfig.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
        targetModule: queueConfig.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      };

      eventBus.publish(QueueActionType.SendMessages, queueEvent);
    }

    return actionResult(void 0);
  };
};

export const getQueueSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [QueueActionType.SendMessages]: getProcessQueueSendMessage(qpqConfig),
});
