import { QPQConfig, qpqCoreUtils, EventBusMessage, StorySession, actionResultError, ErrorTypeEnum } from 'quidproquo-core';

import {
  EventBusSendMessageActionProcessor,
  actionResult,
  EventBusActionType,
} from 'quidproquo-core';
import { publishMessage } from '../../../logic/sns/publishMessage';

import { getEventBusSnsTopicArn } from '../../../awsNamingUtils';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyEventBusMessageWithSession = EventBusMessage<any> & {
  storySession: StorySession;
};

const getProcessEventBusSendMessage = (
  qpqConfig: QPQConfig,
): EventBusSendMessageActionProcessor<any> => {
  return async (
    {
      eventBusName,
      eventBusMessages,

      context
    },
    session,
  ) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const eventBusConfig = qpqCoreUtils.getEventBusConfigByName(eventBusName, qpqConfig);

    if (!eventBusConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Event bus ${eventBusName} not found`);
    }

    const topicArn = getEventBusSnsTopicArn(
      eventBusConfig.owner?.resourceNameOverride || eventBusName,
      qpqConfig,

      eventBusConfig.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      eventBusConfig.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      eventBusConfig.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig),
      eventBusConfig.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
    );

    await publishMessage(
      topicArn,
      region,
      eventBusMessages.map((message) => {
        const eventBusMessageWithSession: AnyEventBusMessageWithSession = {
          ...message,
          storySession: {
            ...session,
            context
          },
        };

        return JSON.stringify(eventBusMessageWithSession);
      }),
    );

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => ({
  [EventBusActionType.SendMessages]: getProcessEventBusSendMessage(qpqConfig),
});
