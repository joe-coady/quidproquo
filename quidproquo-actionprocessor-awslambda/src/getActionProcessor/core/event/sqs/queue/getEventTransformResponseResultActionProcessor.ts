import { SQSBatchItemFailure } from 'aws-lambda';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
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
    const [sqsEvent] = eventParams;

    const batchItemFailures = qpqEventRecordResponses
      .filter((record) => !record.success)
      .map((record, index) => {
        const batchItemFailure: SQSBatchItemFailure = {
          itemIdentifier: sqsEvent.Records[index].messageId,
        };

        return batchItemFailure;
      });

    // Transform back to api gateway
    return actionResult<EventOutput>({
      batchItemFailures,
    });
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
