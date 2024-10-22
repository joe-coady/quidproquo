import {
  EventActionType,
  QPQConfig,
  actionResult,
  HTTPMethod,
  EventGetRecordsActionProcessor,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { qpqWebServerUtils } from 'quidproquo-webserver';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  return async ({ eventParams: [cloudFrontRequestEvent, context] }) => {
    const records = cloudFrontRequestEvent.Records.map((record) => {
      const cfRecordRequest = record.cf.request;

      const headers = Object.keys(cfRecordRequest.headers).reduce(
        (acc, header) => ({
          ...acc,
          [header]: cfRecordRequest.headers[header][0].value,
        }),
        {},
      );

      const internalRecord: InternalEventRecord = {
        domain: qpqWebServerUtils.getBaseDomainName(qpqConfig),
        body: cfRecordRequest.body,
        correlation: context.awsRequestId,
        method: cfRecordRequest.method as HTTPMethod,
        path: cfRecordRequest.uri,
        sourceIp: cfRecordRequest.clientIp,
        headers: headers,
        // TODO: query string support
        query: {},
      };

      return internalRecord;
    });

    return actionResult(records);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
