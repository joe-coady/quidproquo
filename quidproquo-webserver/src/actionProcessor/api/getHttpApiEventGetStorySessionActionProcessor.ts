import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  EventActionType,
  EventGetStorySessionActionProcessor,
  getProcessCustomImplementation,
  MatchStoryResult,
  QPQConfig,
  StorySession,
} from 'quidproquo-core';

import { RouteOptions } from '../../config/settings/route';
import { askGetHttpApiEventStorySession, GetHttpApiEventStorySessionPayload } from '../../stories/askGetHttpApiEventStorySession';
import { HTTPEvent } from '../../types/HTTPEvent';
import { generateUUID } from '../../utils/uuidUtils';

type InternalMatchResult = MatchStoryResult<any, RouteOptions>;

const getProcessGetStorySession = (qpqConfig: QPQConfig): EventGetStorySessionActionProcessor<any, HTTPEvent, InternalMatchResult> => {
  const getSession = getProcessCustomImplementation<any>(
    qpqConfig,
    askGetHttpApiEventStorySession,
    'API Get Story Session',
    null,
    () => new Date().toISOString(),
    generateUUID,
  );

  return async ({ matchStoryResult, qpqEventRecord }, session, actionProcessorList, logger, updateSession, dynamicModuleLoader) => {
    const payload: GetHttpApiEventStorySessionPayload = {
      event: qpqEventRecord,
      routeAuthSettings: matchStoryResult.config?.routeAuthSettings,
      session,
    };

    const [storySession, error] = await getSession(payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader);

    if (error) {
      return actionResult(void 0);
    }

    return actionResult(storySession);
  };
};

export const getHttpApiEventGetStorySessionActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [EventActionType.GetStorySession]: getProcessGetStorySession(qpqConfig),
});
