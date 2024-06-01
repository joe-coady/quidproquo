import { EventActionType, QPQConfig, EventTransformResponseResultActionProcessor, actionResult } from 'quidproquo-core';

import { EventInput, EventOutput, InternalEventOutput } from './types';

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<EventInput, InternalEventOutput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async ({ eventParams, qpqEventRecordResponses }) => {
    const [customMessageTriggerEvent] = eventParams;
    const [emailSendEventResponse] = qpqEventRecordResponses;

    if (emailSendEventResponse.success) {
      const updatedEvent: EventOutput = {
        ...customMessageTriggerEvent,
        response: {
          ...customMessageTriggerEvent.response,
          emailMessage: emailSendEventResponse.result.body,
          emailSubject: emailSendEventResponse.result.subject,
        },
      };

      return actionResult<EventOutput>(updatedEvent);
    }

    // Just let cognito handle the event
    return actionResult<EventOutput>(customMessageTriggerEvent);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
  };
};
