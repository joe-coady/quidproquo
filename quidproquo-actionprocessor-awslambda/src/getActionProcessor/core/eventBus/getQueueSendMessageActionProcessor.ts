import { QPQConfig, qpqCoreUtils, EventBusMessage, StorySession } from 'quidproquo-core';

import {
  EventBusSendMessageActionProcessor,
  actionResult,
  EventBusActionType,
} from 'quidproquo-core';
import { publishMessage } from '../../../logic/sns/publishMessage';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getCFExportNameSnsTopicArnFromConfig } from '../../../awsNamingUtils';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyEventBusMessageWithSession = EventBusMessage<any> & {
  storySession: StorySession;
};

const getProcessEventBusSendMessage = (
  qpqConfig: QPQConfig,
): EventBusSendMessageActionProcessor<any> => {
  return async ({ eventBusName, eventBusMessages }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const topicArn = await getExportedValue(
      getCFExportNameSnsTopicArnFromConfig(eventBusName, qpqConfig),
      region,
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
