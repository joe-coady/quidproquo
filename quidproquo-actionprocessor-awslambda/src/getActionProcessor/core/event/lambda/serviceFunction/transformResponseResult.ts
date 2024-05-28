import { EventActionType, QPQConfig, EventTransformResponseResultActionProcessor, actionResult, actionResultError } from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput } from './types';

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [record] = qpqEventRecordResponses;

    if (record.error) {
      return actionResultError(record.error.errorType, record.error.errorText, record.error.errorStack);
    }

    // Transform back to api gateway
    return actionResult<EventOutput>(record.result);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
