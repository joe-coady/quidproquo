import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { getQpqAttributesFromCognitoStringMap } from '../../../../../logic/cognito/cognitoAttributeMap';
import { getChallengeSessionFromCognitoTriggerEventSession } from '../utils';
import { EventInput, InternalEventRecord } from './types';

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

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
