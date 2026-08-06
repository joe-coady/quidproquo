import { actionResult, askEventGetRecordsBase, createActionProcessor, EventActionType, HTTPMethod, ProcessorFor, QPQConfig } from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): ProcessorFor<typeof askEventGetRecordsBase> => {
  return async ({ eventParams }) => {
    // Registered for one event source only, so the base requester's
    // source-agnostic payload is narrowed to this source's types here.
    const [cloudFrontRequestEvent, context] = eventParams as EventInput;

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

export const getEventGetRecordsActionProcessor = createActionProcessor(askEventGetRecordsBase, getProcessGetRecords);
