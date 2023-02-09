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
} from 'quidproquo-core';

import { QueueEventParams, QueueEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { matchUrl } from '../../../awsLambdaUtils';

import { Context, SQSRecord } from 'aws-lambda';

type AnyQueueEventParams = QueueEventParams<QueueMessage<any>>;

const getProcessTransformEventParams = (
  qpqConfig: QPQConfig,
): EventTransformEventParamsActionProcessor<[SQSRecord, Context], AnyQueueEventParams> => {
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
  AnyQueueEventParams,
  QueueEventResponse
> => {
  return async ({ response }) => {
    return actionResult<QueueEventResponse>(response);
  };
};

const getProcessAutoRespond = (): EventAutoRespondActionProcessor<AnyQueueEventParams> => {
  return async (payload) => {
    return actionResult(null);
  };
};

const getProcessMatchStory = (
  queueQueueProcessors: QpqQueueProcessors,
): EventMatchStoryActionProcessor<AnyQueueEventParams> => {
  return async (payload) => {
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

    return actionResult<MatchStoryResult>({
      src: sourceEntry.src,
      runtime: sourceEntry.runtime,
      options: matchedQueueType.match.params || {},
    });
  };
};

export default (config: QPQConfig) => {
  const queueQueueProcessors = qpqCoreUtils.getQueueQueueProcessors('airtable', config);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(config),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(config),
    [EventActionType.AutoRespond]: getProcessAutoRespond(),
    [EventActionType.MatchStory]: getProcessMatchStory(queueQueueProcessors),
  };
};
