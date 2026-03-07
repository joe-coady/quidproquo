import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventAutoRespondActionProcessor,
  getProcessCustomImplementation,
  MatchStoryResult,
  QPQConfig,
} from 'quidproquo-core';

import { RouteOptions } from '../../config/settings/route';
import { askValidateRouteAuth, ValidateRouteAuthPayload } from '../../stories/askValidateRouteAuth';
import { HTTPEvent, HTTPEventResponse } from '../../types/HTTPEvent';
import { getCorsHeaders } from '../../utils/headerUtils';
import { generateUUID } from '../../utils/uuidUtils';

type InternalMatchResult = MatchStoryResult<any, RouteOptions>;

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<HTTPEvent, InternalMatchResult, HTTPEventResponse> => {
  const validateAuth = getProcessCustomImplementation<any>(
    qpqConfig,
    askValidateRouteAuth,
    'API Auth Validation',
    null,
    () => new Date().toISOString(),
    generateUUID,
  );

  return async ({ qpqEventRecord, matchResult }, session, actionProcessorList, logger, updateSession, dynamicModuleLoader) => {
    // Just auto respond for options requests
    if (qpqEventRecord.method === 'OPTIONS') {
      return actionResult({
        status: 200,
        isBase64Encoded: false,
        body: '',
        headers: getCorsHeaders(qpqConfig, matchResult.config || {}, qpqEventRecord.headers),
      });
    }

    const authPayload: ValidateRouteAuthPayload = {
      event: qpqEventRecord,
      routeAuthSettings: matchResult.config?.routeAuthSettings,
    };

    const [authValid, authError] = await validateAuth(authPayload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader);

    if (authError || !authValid) {
      return actionResult({
        status: 401,
        isBase64Encoded: false,
        body: JSON.stringify({
          message: 'You are unauthorized to access this resource',
        }),
        headers: getCorsHeaders(qpqConfig, matchResult.config || {}, qpqEventRecord.headers),
      });
    }

    return actionResult(null);
  };
};

export const getHttpApiEventAutoRespondActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
});
