import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  EventBusActionType,
  EventBusMessage,
  EventBusSendMessageActionProcessor,
  EventBusSendMessagesErrorTypeEnum,
  QPQConfig,
  qpqCoreUtils,
  StorySession,
  toCrossServiceSession,
} from 'quidproquo-core';

import { getEventBusSnsTopicArn } from '../../../awsNamingUtils';
import { publishMessage } from '../../../logic/sns/publishMessage';

// TODO: Unify this once the lambda code moves from CDK to awslambda
type AnyEventBusMessageWithSession = EventBusMessage<any> & {
  storySession: StorySession;
};

const getProcessEventBusSendMessage = (qpqConfig: QPQConfig): EventBusSendMessageActionProcessor<any> => {
  return async ({ eventBusName, eventBusMessages }, session) => {
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

    try {
      await publishMessage(
        topicArn,
        region,
        eventBusMessages.map((message) => {
          const eventBusMessageWithSession: AnyEventBusMessageWithSession = {
            ...message,
            storySession: toCrossServiceSession(session),
          };

          return JSON.stringify(eventBusMessageWithSession);
        }),
      );

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        AuthorizationErrorException: () => actionResultError(EventBusSendMessagesErrorTypeEnum.AccessDenied, 'Access denied publishing to event bus'),
        NotFoundException: () => actionResultError(EventBusSendMessagesErrorTypeEnum.TopicNotFound, `Event bus topic not found: ${eventBusName}`),
        InternalErrorException: () => actionResultError(EventBusSendMessagesErrorTypeEnum.ServiceUnavailable, 'Event bus service unavailable'),
        ThrottledException: () => actionResultError(EventBusSendMessagesErrorTypeEnum.ServiceUnavailable, 'Event bus throttled'),
      });
    }
  };
};

export const getEventBusSendMessagesActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventBusActionType.SendMessages]: getProcessEventBusSendMessage(qpqConfig),
});
