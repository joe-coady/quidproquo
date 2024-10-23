import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetStorySessionActionProcessor,
  QPQConfig,
  StorySession,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { decodeAccessToken } from '../../../../../logic/cognito';
import { EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<EventInput, InternalEventRecord, MatchResult> => {
  return async ({ matchStoryResult, qpqEventRecord }, session) => {
    const accessToken = qpqWebServerUtils.getAccessTokenFromHeaders(qpqEventRecord.headers);

    if (!accessToken) {
      return actionResult(void 0);
    }

    // if this endpoint has no auth settings, BUT we do have an access token
    // then we want to just attempt to extract info for logs, but we will say that its
    // wasValid = false
    if (!matchStoryResult.config?.routeAuthSettings?.userDirectoryName) {
      // If this endpoint is unauthenticated, then we will just decode it, and say it wasnt valid, for logs
      const info = qpqWebServerUtils.decodeJWT<{
        sub?: string;
        userId?: string;
        username?: string;
        id?: string;
        exp?: number;
      }>(accessToken);

      return actionResult({
        ...session,

        decodedAccessToken: {
          exp: info?.exp || 0,
          userDirectory: '',
          userId: info?.sub || info?.id || info?.userId || info?.username || '',
          username: info?.username || info?.userId || info?.sub || info?.id || '',
          wasValid: false,
        },
      });
    }

    const decodedAccessToken = await decodeAccessToken(matchStoryResult.config.routeAuthSettings.userDirectoryName, qpqConfig, accessToken, true);

    return actionResult({
      ...session,

      decodedAccessToken,
    });
  };
};

export const getEventGetStorySessionActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
});
