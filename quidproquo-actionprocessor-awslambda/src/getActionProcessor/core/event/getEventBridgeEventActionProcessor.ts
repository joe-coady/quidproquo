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

// TODO: Get rid of {} and any types
type MatchOptions = {};
type MatchConfig = any;
type EventBridgeEventMatchStoryResult = MatchStoryResult<MatchOptions, MatchConfig>;

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
const getProcessAutoRespond = (): EventAutoRespondActionProcessor<
  ScheduledEventParams<any>,
  EventBridgeEventMatchStoryResult
> => {
  return async () => actionResult(null);
};

const getProcessMatchStory = (
  lambdaRuntimeConfig?: LambdaRuntimeConfig,
  // TODO: Get rid of type {}
): EventMatchStoryActionProcessor<ScheduledEventParams<any>, EventBridgeEventMatchStoryResult> => {
  return async (payload) => {
    if (!lambdaRuntimeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, 'event runtime not found');
    }

    return actionResult<EventBridgeEventMatchStoryResult>({
      src: lambdaRuntimeConfig.src,
      runtime: lambdaRuntimeConfig.runtime,
      runtimeOptions: {},
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
