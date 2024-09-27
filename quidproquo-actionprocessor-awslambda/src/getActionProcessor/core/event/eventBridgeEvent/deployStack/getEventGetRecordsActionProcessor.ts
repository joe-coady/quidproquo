import {
  EventActionType,
  QPQConfig,
  actionResult,
  EventGetRecordsActionProcessor,
  DeployEventType,
  DeployEventStatusType,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord } from './types';
import { getApiStackName, getWebStackName } from '../../../../../awsNamingUtils';

const deployTypeMap: Record<string, DeployEventStatusType> = {
  UPDATE_COMPLETE: DeployEventStatusType.Update,
  CREATE_COMPLETE: DeployEventStatusType.Create,
  DELETE_COMPLETE: DeployEventStatusType.Delete,
};

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [eventBridgeEvent, context] }) => {
    const status = eventBridgeEvent.detail['status-details'].status || '';
    const stackId = eventBridgeEvent.detail['stack-id'];

    const regex = /:stack\/([^\/]+)/;
    const match = stackId.match(regex);

    const stackName = match && match[1] ? match[1] : '';

    const internalEventRecord: InternalEventRecord = {
      deployEventType: DeployEventType.Unknown,
      deployEventStatusType: deployTypeMap[status] || DeployEventStatusType.Unknown,
    };

    if (stackName === getApiStackName(qpqConfig)) {
      internalEventRecord.deployEventType = DeployEventType.Api;
    } else if (stackName === getWebStackName(qpqConfig)) {
      internalEventRecord.deployEventType = DeployEventType.Web;
    }

    console.log('internalEventRecord', internalEventRecord);

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
