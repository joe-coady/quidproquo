import {
  EventActionType,
  QPQConfig,
  EventTransformResponseResultActionProcessor,
  actionResult,
  ErrorTypeEnum,
  actionResultError,
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

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
