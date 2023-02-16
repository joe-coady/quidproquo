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

import { LambdaRuntimeConfig } from '../../../runtimeConfig/QPQAWSResourceMap';

import { EventBridgeEvent, Context } from 'aws-lambda';

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
const getProcessTransformResponseResult = (): EventTransformResponseResultActionProcessor<
  // TODO: Fix types - look at getCloudFrontOriginRequestEventActionProcessor
  any,
  any,
  any
> => {
  return async ({ response }) => actionResult<any>(response);
};

// never early exit (maybe add validation?)
const getProcessAutoRespond = (): EventAutoRespondActionProcessor<ScheduledEventParams<any>> => {
  return async () => actionResult(null);
};

const getProcessMatchStory = (
  lambdaRuntimeConfig?: LambdaRuntimeConfig,
  // TODO: Get rid of type {}
): EventMatchStoryActionProcessor<ScheduledEventParams<any>, {}> => {
  return async (payload) => {
    if (!lambdaRuntimeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, 'event runtime not found');
    }

    return actionResult<MatchStoryResult<{}>>({
      src: lambdaRuntimeConfig.src,
      runtime: lambdaRuntimeConfig.runtime,
      options: {},
    });
  };
};

export default (runtimeConfig: LambdaRuntimeConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(),
    [EventActionType.AutoRespond]: getProcessAutoRespond(),
    [EventActionType.MatchStory]: getProcessMatchStory(runtimeConfig),
  };
};
