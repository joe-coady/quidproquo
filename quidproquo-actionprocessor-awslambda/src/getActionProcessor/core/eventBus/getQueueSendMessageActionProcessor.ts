import { QPQConfig, qpqCoreUtils, EventBusMessage, StorySession } from 'quidproquo-core';

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

      moduleOverride,
      environmentOverride,
      featureOverride,
      applicationOverride,
    },
    session,
  ) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const topicArn = getEventBusSnsTopicArn(
      eventBusName,
      qpqConfig,

      moduleOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      environmentOverride || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig),
      featureOverride || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
    );

    console.log(
      moduleOverride || qpqCoreUtils.getApplicationModuleName(qpqConfig),
      environmentOverride || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      applicationOverride || qpqCoreUtils.getApplicationName(qpqConfig),
      featureOverride || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
    );

    await publishMessage(
      topicArn,
      region,
      eventBusMessages.map((message) => {
        const eventBusMessageWithSession: AnyEventBusMessageWithSession = {
          ...message,
          storySession: session,
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
