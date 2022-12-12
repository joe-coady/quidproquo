import {
  EventActionType,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  ScheduledEventParams,
} from 'quidproquo-core';

import { QPQAWSLambdaConfig, LambdaRuntimeConfig } from '../../../runtimeConfig/QPQAWSLambdaConfig';

import { EventBridgeEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

const getProcessTransformEventParams = (): EventTransformEventParamsActionProcessor<
  [EventBridgeEvent<any, any>, Context],
  ScheduledEventParams<any>
> => {
  return async ({ eventParams: [eventBridgeEvent, context] }) => {
    return actionResult({
      time: eventBridgeEvent.time,
      correlation: context.awsRequestId,
      detail: eventBridgeEvent.detail,
    });
  };
};

// No transform
const getProcessTransformResponseResult = (): EventTransformResponseResultActionProcessor<any> => {
  return async ({ response }) => actionResult<any>(response);
};

// never early exit (maybe add validation?)
const getProcessAutoRespond = (): EventAutoRespondActionProcessor<ScheduledEventParams<any>> => {
  return async () => actionResult(null);
};

const getProcessMatchStory = (
  lambdaRuntimeConfig?: LambdaRuntimeConfig,
): EventMatchStoryActionProcessor<ScheduledEventParams<any>> => {
  return async (payload) => {
    if (!lambdaRuntimeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, 'event runtime not found');
    }

    return actionResult<MatchStoryResult>({
      src: lambdaRuntimeConfig.src,
      runtime: lambdaRuntimeConfig.runtime,
      options: {},
    });
  };
};

export default (runtimeConfig: QPQAWSLambdaConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(),
    [EventActionType.AutoRespond]: getProcessAutoRespond(),
    [EventActionType.MatchStory]: getProcessMatchStory(runtimeConfig.lambdaRuntimeConfig),
  };
};
