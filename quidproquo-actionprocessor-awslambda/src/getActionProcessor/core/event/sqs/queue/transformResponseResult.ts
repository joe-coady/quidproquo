import { EventActionType, QPQConfig, EventTransformResponseResultActionProcessor, actionResult } from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput, InternalEventRecord } from './types';
import { SQSBatchItemFailure } from 'aws-lambda';

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

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
