import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetRecordsActionProcessor,
  HTTPMethod,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { HTTPEvent, qpqWebServerUtils } from 'quidproquo-webserver';

import { parseMultipartFormData } from '../../utils/parseMultipartFormData';
import { EventInput, InternalEventRecord } from './types';

const getProcessGetRecords = (qpqConfig: QPQConfig): EventGetRecordsActionProcessor<EventInput, InternalEventRecord> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ eventParams: [apiGatewayEvent, context] }) => {
    // Initialize `path` by removing the service name prefix from `apiGatewayEvent.path`.
    // This adjustment is necessary because the API gateway routes requests to services based on
    // a base path that includes the service name. By subtracting `serviceName.length + 1` from the
    // substring method's start index, we effectively strip the leading `/<serviceName>` segment,
    // accounting for the leading slash. This ensures `path` reflects the intended resource location
    // after the service name. Defaults to '/' if `apiGatewayEvent.path` is not provided.
    const path = (apiGatewayEvent.path || '/').substring(serviceName.length + 1);

    const internalEventRecord: InternalEventRecord = {
      path,
      query: {
        ...(apiGatewayEvent.multiValueQueryStringParameters || {}),
        ...(apiGatewayEvent.queryStringParameters || {}),
      } as { [key: string]: undefined | string | string[] },
      body: apiGatewayEvent.body === null ? undefined : apiGatewayEvent.body,
      headers: apiGatewayEvent.headers,
      method: apiGatewayEvent.httpMethod as HTTPMethod,
      correlation: context.awsRequestId,
      sourceIp: apiGatewayEvent.requestContext.identity.sourceIp,
      isBase64Encoded: apiGatewayEvent.isBase64Encoded,
    };

    // Transform the body if its a multipart/form-data
    if ((qpqWebServerUtils.getHeaderValue('Content-Type', apiGatewayEvent.headers) || '').startsWith('multipart/form-data') && apiGatewayEvent.body) {
      internalEventRecord.files = await parseMultipartFormData(apiGatewayEvent);
    }

    return actionResult([internalEventRecord]);
  };
};

export const getEventGetRecordsActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetRecords]: getProcessGetRecords(qpqConfig),
});
