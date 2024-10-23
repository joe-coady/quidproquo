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
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [record] = qpqEventRecordResponses;

    // Just return the either result back, let the caller deal with it.
    return actionResult<EventOutput>(record);
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
