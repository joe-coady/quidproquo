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
  QpqQueueProcessors,
  QueueMessage,
  QueueQPQConfigSetting,
} from 'quidproquo-core';

import {
  QueueEvent,
  QueueEventResponse,
  qpqWebServerUtils,
  QueueEventTypeParams,
} from 'quidproquo-webserver';

import { matchUrl } from '../../../awsLambdaUtils';

import { Context, SQSRecord } from 'aws-lambda';

type AnyQueueEvent = QueueEvent<QueueMessage<any>>;

export const getQueueConfigSetting = (): QueueQPQConfigSetting => {
  const queueQPQConfigSetting: QueueQPQConfigSetting = JSON.parse(
    process.env.queueQPQConfigSetting as string,
  );

  // TODO: Validate here

  return queueQPQConfigSetting;
};

const getProcessTransformEventParams = (
  qpqConfig: QPQConfig,
): EventTransformEventParamsActionProcessor<[SQSRecord, Context], AnyQueueEvent> => {
  return async ({ eventParams: [record, context] }) => {
    const parsedRecord = JSON.parse(record.body) as QueueMessage<any>;

    return actionResult({
      message: {
        type: parsedRecord.type,
        payload: parsedRecord.payload,
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
  QueueEventTypeParams,
  string
> => {
  return async (payload) => {
    return actionResult(null);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<AnyQueueEvent, QueueEventTypeParams, string> => {
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
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `queue type not found ${payload.transformedEventParams.message.type}`,
      );
    }

    const sourceEntry = queueQueueProcessors[matchedQueueType.queueType];

    return actionResult<MatchStoryResult<QueueEventTypeParams, string>>({
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
