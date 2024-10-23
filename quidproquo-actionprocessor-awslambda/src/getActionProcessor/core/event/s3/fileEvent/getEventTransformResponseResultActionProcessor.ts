import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventTransformResponseResultActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput, InternalEventRecord } from './types';

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const onesThatErrored = qpqEventRecordResponses.filter((r) => !r.success);
    if (onesThatErrored.length > 0) {
      return actionResultError(ErrorTypeEnum.GenericError, `[${onesThatErrored.length}] files unable to be processed.`);
    }

    // Transform back to api gateway
    return actionResult<EventOutput>(void 0);
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
