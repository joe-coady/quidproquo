import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getQpqAttributesFromCognitoStringMap } from '../../../../../logic/cognito/cognitoAttributeMap';
import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [event, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      challengeAnswer: event.request.challengeAnswer ? JSON.parse(event.request.challengeAnswer) : {},
      userAttributes: getQpqAttributesFromCognitoStringMap(event.request.userAttributes),
      userNotFound: event.request.userNotFound,
      privateChallengeParameters: event.request.privateChallengeParameters,
    };

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
