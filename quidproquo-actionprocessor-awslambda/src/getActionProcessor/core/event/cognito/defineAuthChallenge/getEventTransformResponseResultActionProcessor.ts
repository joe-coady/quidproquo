import {
  EventActionType,
  QPQConfig,
  EventTransformResponseResultActionProcessor,
  actionResult,
  QPQError,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput } from './types';

const getResponseFromErrorResult = (error: QPQError): InternalEventOutput => {
  return {
    runCreateAuthChallenge: false,
    failAuthentication: true,
    issueTokens: false,
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

        failAuthentication: successRecord.failAuthentication,
        challengeName: successRecord.runCreateAuthChallenge ? 'CUSTOM_CHALLENGE' : '',
        issueTokens: successRecord.issueTokens,
      },
    };

    return actionResult<EventOutput>(eventOutput);
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
