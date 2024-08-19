import { EventActionType, QPQConfig, actionResult, EventGetRecordsActionProcessor } from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

import { getQpqAttributesFromCognitoStringMap } from '../../../../../logic/cognito/cognitoAttributeMap';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [event, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      challengeAnswer: event.request.challengeAnswer,
      userAttributes: getQpqAttributesFromCognitoStringMap(event.request.userAttributes),
      userNotFound: event.request.userNotFound,
      privateChallengeParameters: event.request.privateChallengeParameters,
    };

    return actionResult([internalEventRecord]);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  };
};
