import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventBusActionType,
  EventBusMessage,
  EventBusSendMessageActionProcessor,
  QPQConfig,
  qpqCoreUtils,
  StorySession,
} from 'quidproquo-core';

import { getEventBusSnsTopicArn } from '../../../awsNamingUtils';
import { publishMessage } from '../../../logic/sns/publishMessage';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyEventBusMessageWithSession = EventBusMessage<any> & {
  storySession: StorySession;
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
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

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
            context,
          },
        };

        return JSON.stringify(eventBusMessageWithSession);
      }),
    );

    return actionResult(void 0);
  };
};

export const getEventBusSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventBusActionType.SendMessages]: getProcessEventBusSendMessage(qpqConfig),
});
