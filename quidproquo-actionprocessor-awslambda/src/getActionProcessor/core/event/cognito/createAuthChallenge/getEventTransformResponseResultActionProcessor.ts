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
    const [customMessageTriggerEvent] = eventParams;
    const [qpqEventRecordResponse] = qpqEventRecordResponses;

    // If the runtime failed for some reason, just return this out as a fail
    if (!qpqEventRecordResponse.success) {
      return actionResultError(
        qpqEventRecordResponse.error.errorType,
        qpqEventRecordResponse.error.errorText,
        qpqEventRecordResponse.error.errorStack,
      );
    }

    // No error has happened
    let successRecord = qpqEventRecordResponse.result;

    const eventOutput: EventOutput = {
      ...customMessageTriggerEvent,
      response: {
        ...customMessageTriggerEvent.response,
      },
    };

    // challengeMetadata / publicChallengeParameters / challengeMetadata can all be null.
    if (successRecord.challengeName) {
      eventOutput.response.challengeMetadata = successRecord.challengeName;
    }

    if (successRecord.privateChallengeParameters) {
      eventOutput.response.privateChallengeParameters = successRecord.privateChallengeParameters;
    }

    if (successRecord.publicChallengeParameters) {
      eventOutput.response.publicChallengeParameters = successRecord.publicChallengeParameters;
    }

    return actionResult<EventOutput>(eventOutput);
  };
};

export const getEventTransformResponseResultActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
});
