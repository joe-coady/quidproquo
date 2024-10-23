import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { InternalEventRecord, MatchResult } from './types';

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  const serviceFunctions = qpqWebServerUtils.getAllServiceFunctions(qpqConfig);

  return async ({ qpqEventRecord }) => {
    // Find the most relevant match
    const matchedRoute = serviceFunctions.find((sf) => sf.functionName === qpqEventRecord.functionName);

    if (!matchedRoute) {
      return actionResultError(ErrorTypeEnum.NotFound, `service function not found [${qpqEventRecord.functionName}]`);
    }

    return actionResult<MatchResult>({
      runtime: matchedRoute.runtime,
    });
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
