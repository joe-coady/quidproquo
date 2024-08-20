import { EventActionType, QPQConfig, actionResult, EventGetRecordsActionProcessor } from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';

import { getQpqAttributesFromCognitoStringMap } from '../../../../../logic/cognito/cognitoAttributeMap';
import { getChallengeSessionFromCognitoTriggerEventSession } from '../utils';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [event, context] }) => {
    const internalEventRecord: InternalEventRecord = {
      userName: event.userName,
      session: getChallengeSessionFromCognitoTriggerEventSession(event.request.session),
      userAttributes: getQpqAttributesFromCognitoStringMap(event.request.userAttributes),
    };

    return actionResult([internalEventRecord]);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
  };
};
