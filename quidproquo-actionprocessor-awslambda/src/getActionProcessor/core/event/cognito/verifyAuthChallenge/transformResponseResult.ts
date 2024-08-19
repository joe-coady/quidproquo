import { EventActionType, QPQConfig, EventTransformResponseResultActionProcessor, actionResult, QPQError } from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput } from './types';

const getResponseFromErrorResult = (error: QPQError): InternalEventOutput => {
  return {
    answerCorrect: false,
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [customMessageTriggerEvent] = eventParams;
    const [qpqEventRecordResponse] = qpqEventRecordResponses;

    // If we have an error, we need to transform it to a response, otherwise we can just use the record as is
    let successRecord = qpqEventRecordResponse.success ? qpqEventRecordResponse.result : getResponseFromErrorResult(qpqEventRecordResponse.error);

    const eventOutput: EventOutput = {
      ...customMessageTriggerEvent,
      response: {
        ...customMessageTriggerEvent.response,

        answerCorrect: successRecord.answerCorrect,
      },
    };

    return actionResult<EventOutput>(eventOutput);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
