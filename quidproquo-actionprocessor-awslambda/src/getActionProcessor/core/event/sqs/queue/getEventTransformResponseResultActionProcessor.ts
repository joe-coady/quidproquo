import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventTransformResponseResultActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { SQSBatchItemFailure } from 'aws-lambda';

import { EventInput, EventOutput, InternalEventOutput, InternalEventRecord } from './types';

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [sqsEvent] = eventParams;

    const batchItemFailures: SQSBatchItemFailure[] = qpqEventRecordResponses
      .map((record, index) => ({ record, index }))
      .filter(({ record }) => !record.success)
      .map(({ index }) => ({
        itemIdentifier: sqsEvent.Records[index].messageId,
      }));

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
