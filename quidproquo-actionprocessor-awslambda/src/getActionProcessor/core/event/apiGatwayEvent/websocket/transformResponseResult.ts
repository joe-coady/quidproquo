import { EventActionType, QPQConfig, EventTransformResponseResultActionProcessor, actionResult, actionResultError } from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput } from './types';

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [record] = qpqEventRecordResponses;

    if (!record.success) {
      return actionResultError(record.error.errorType, record.error.errorText, record.error.errorStack);
    }

    // Transform back to api gateway
    return actionResult<EventOutput>({
      statusCode: 200,
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
