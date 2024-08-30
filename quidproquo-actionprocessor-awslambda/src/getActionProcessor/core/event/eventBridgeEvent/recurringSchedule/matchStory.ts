import { EventActionType, EventMatchStoryActionProcessor, QPQConfig, actionResult, actionResultError } from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';
import { LambdaRuntimeConfig } from '../../../../../runtimeConfig/QPQAWSResourceMap';

// TODO: Clean this shit up
const lambdaRuntimeConfig: LambdaRuntimeConfig = JSON.parse(process.env.lambdaRuntimeConfig || '{}');

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  return async ({ qpqEventRecord }) => {
    return actionResult<MatchResult>({
      runtime: lambdaRuntimeConfig.runtime,
      runtimeOptions: {},
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
