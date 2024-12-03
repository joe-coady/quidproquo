import { ActionProcessorList, ActionProcessorListResolver, actionResultError, ErrorTypeEnum, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { actionResult, QueueActionType, QueueSendMessageActionProcessor } from 'quidproquo-core';

import { v4 as uuidV4 } from 'uuid';

import { eventBus } from '../../../logic/eventBus';
import { AnyQueueMessageWithSession } from '../event/queue/types';

const getProcessQueueSendMessage = (qpqConfig: QPQConfig): QueueSendMessageActionProcessor<any> => {
  return async ({ queueName, queueMessages, context }, session) => {
    const queueConfig = qpqCoreUtils.getQueueByName(qpqConfig, queueName);
    if (!queueConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Queue ${queueName} not found`);
    }

    for (const queueMessage of queueMessages) {
      const queueEvent: AnyQueueMessageWithSession = {
        payload: queueMessage.payload,
        type: queueMessage.type,

        storySession: {
          ...session,
          context,
        },

        messageId: uuidV4(),
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
