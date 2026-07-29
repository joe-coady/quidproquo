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

// Throwing here fails the whole batch, which makes Lambda retry it and — by default —
// stall the shard until it succeeds or the records expire. That is the correct default for
// a projection (falling behind loudly beats silently skipping a change), but it is exactly
// why the event source mapping must be given a retry bound and a failure destination; see
// the stream construct.
const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const onesThatErrored = qpqEventRecordResponses.filter((r) => !r.success);
    if (onesThatErrored.length > 0) {
      return actionResultError(ErrorTypeEnum.GenericError, `[${onesThatErrored.length}] stream records unable to be processed.`);
    }

    return actionResult<EventOutput>(void 0);
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
