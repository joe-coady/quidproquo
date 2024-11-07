import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventBusActionType,
  EventBusSendMessageActionProcessor,
  QPQConfig,
  qpqCoreUtils,
  QueueMessage,
  StorySession,
} from 'quidproquo-core';

import { eventBus } from '../../../logic/eventBus';

export type AnyEventBusMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;

  targetApplication: string;
  targetEnvironment: string;
  targetModule: string;
  targetFeature?: string;
};

const getProcessEventBusSendMessage = (qpqConfig: QPQConfig): EventBusSendMessageActionProcessor<any> => {
  return async (
    {
      eventBusName,
      eventBusMessages,

      context,
    },
    session,
  ) => {
    const eventBusConfig = qpqCoreUtils.getEventBusConfigByName(eventBusName, qpqConfig);
    if (!eventBusConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Event bus ${eventBusName} not found`);
    }

    for (const eventBusMessage of eventBusMessages) {
      const eventBusEvent: AnyEventBusMessageWithSession = {
        payload: eventBusMessage.payload,
        type: eventBusMessage.type,

        storySession: session,

        targetApplication: eventBusConfig.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig),
        targetEnvironment: eventBusConfig.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
        targetFeature: eventBusConfig.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
        targetModule: eventBusConfig.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      };

      eventBus.publish(EventBusActionType.SendMessages, eventBusEvent);
    }

    return actionResult(void 0);
  };
};

export const getEventBusSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventBusActionType.SendMessages]: getProcessEventBusSendMessage(qpqConfig),
});
