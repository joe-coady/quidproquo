import { EventActionType, QPQConfig, EventAutoRespondActionProcessor, actionResult } from 'quidproquo-core';

import { qpqWebServerUtils } from 'quidproquo-webserver';

import { isAuthValid } from '../../utils/isAuthValid';
import { InternalEventOutput, InternalEventRecord, MatchResult } from './types';

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventRecord, MatchResult, InternalEventOutput> => {
  return async ({ qpqEventRecord, matchResult }) => {
    // Just auto respond for options requests
    if (qpqEventRecord.method === 'OPTIONS') {
      return actionResult({
        status: 200,
        isBase64Encoded: false,
        body: '',
        headers: qpqWebServerUtils.getCorsHeaders(qpqConfig, matchResult.config || {}, qpqEventRecord.headers),
      });
    }

    // TODO: We can pull out the jwt from the session if thats a better way?
    // Think about that when you dont have covid.
    const authValid = await isAuthValid(
      qpqConfig,
      qpqWebServerUtils.getHeaderValue('Authorization', qpqEventRecord.headers),
      qpqWebServerUtils.getHeaderValue('x-api-key', qpqEventRecord.headers),
      matchResult.config?.routeAuthSettings,
    );

    if (!authValid) {
      return actionResult({
        status: 401,
        isBase64Encoded: false,
        body: JSON.stringify({
          message: 'You are unauthorized to access this resource',
        }),
        headers: qpqWebServerUtils.getCorsHeaders(qpqConfig, matchResult.config || {}, qpqEventRecord.headers),
      });
    }

    return actionResult(null);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
  };
};
