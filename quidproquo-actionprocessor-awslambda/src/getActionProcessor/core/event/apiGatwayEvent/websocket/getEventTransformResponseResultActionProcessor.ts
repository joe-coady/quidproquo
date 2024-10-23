import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  EventActionType,
  EventTransformResponseResultActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

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

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
