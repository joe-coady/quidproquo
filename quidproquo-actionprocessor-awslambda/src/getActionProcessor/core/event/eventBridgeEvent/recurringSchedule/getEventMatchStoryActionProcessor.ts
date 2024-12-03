import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { LambdaRuntimeConfig } from '../../../../../runtimeConfig/QPQAWSResourceMap';
import { EventInput, InternalEventRecord, MatchResult } from './types';

// TODO: Clean this shit up
const lambdaRuntimeConfig: LambdaRuntimeConfig = JSON.parse(process.env.lambdaRuntimeConfig || '{}');

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult, EventInput> => {
  return async ({ qpqEventRecord }) => {
    return actionResult<MatchResult>({
      runtime: lambdaRuntimeConfig.runtime,
      runtimeOptions: {},
    });
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
