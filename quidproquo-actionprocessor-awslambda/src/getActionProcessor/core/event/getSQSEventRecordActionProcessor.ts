import {
  EventActionType,
  QPQConfig,
  qpqCoreUtils,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  QueueMessage,
  QueueQPQConfigSetting,
  StorySession,
} from 'quidproquo-core';

import { QueueEvent, QueueEventResponse, QueueEventTypeParams } from 'quidproquo-webserver';

import { matchUrl } from '../../../awsLambdaUtils';

import { Context } from 'aws-lambda';

type AnyQueueEvent = QueueEvent<QueueMessage<any>>;
export type SqsEventMatchStoryResult = MatchStoryResult<QueueEventTypeParams, string>;

export const getQueueConfigSetting = (): QueueQPQConfigSetting => {
  const queueQPQConfigSetting: QueueQPQConfigSetting = JSON.parse(
    process.env.queueQPQConfigSetting as string,
  );

  // TODO: Validate here

  return queueQPQConfigSetting;
};

const getProcessTransformEventParams = (
  qpqConfig: QPQConfig,
): EventTransformEventParamsActionProcessor<[QueueMessage<any>, Context], AnyQueueEvent> => {
  return async ({ eventParams: [record, context] }) => {
    return actionResult({
      message: {
        type: record.type,
        payload: record.payload,
      },
    });
  };
};

const getProcessTransformResponseResult = (
  configs: QPQConfig,
): EventTransformResponseResultActionProcessor<
  QueueEventResponse,
  AnyQueueEvent,
  QueueEventResponse
> => {
  return async ({ response }) => {
    return actionResult<QueueEventResponse>(response);
  };
};

const getProcessAutoRespond = (): EventAutoRespondActionProcessor<
  AnyQueueEvent,
  SqsEventMatchStoryResult,
  boolean
> => {
  return async (payload) => {
    // If we couldn't match and hasn't thrown error, we will just gracefully exit.
    return actionResult(!payload.matchResult.src);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<AnyQueueEvent, SqsEventMatchStoryResult> => {
  const queueQPQConfigSetting = getQueueConfigSetting();

  return async (payload) => {
    const queueQueueProcessors = qpqCoreUtils.getQueueQueueProcessors(
      queueQPQConfigSetting.name,
      qpqConfig,
    );

    const queueTypes = Object.keys(queueQueueProcessors).sort();

    // Find the most relevant match
    const matchedQueueType = queueTypes
      .map((qt) => ({
        match: matchUrl(qt, payload.transformedEventParams.message.type),
        queueType: qt,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedQueueType) {
      // If we have event bus subscriptions then we don't want to error if we can't match
      // early exit will just exit gracefully
      if (queueQPQConfigSetting.eventBusSubscriptions.length > 0) {
        return actionResult<SqsEventMatchStoryResult>({});
      }

      return actionResultError(
        ErrorTypeEnum.NotFound,
        `queue type not found ${payload.transformedEventParams.message.type}`,
      );
    }

    const sourceEntry = queueQueueProcessors[matchedQueueType.queueType];

    return actionResult<SqsEventMatchStoryResult>({
      src: sourceEntry.src,
      runtime: sourceEntry.runtime,
      runtimeOptions: matchedQueueType.match.params || {},
      config: matchedQueueType.queueType,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(qpqConfig),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
