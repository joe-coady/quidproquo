import { awsLambdaUtils } from 'quidproquo-actionprocessor-awslambda';
import {
  actionResult,
  actionResultError,
  askEventMatchStoryBase,
  createActionProcessor,
  ErrorTypeEnum,
  EventActionType,
  ProcessorFor,
  QPQConfig,
} from 'quidproquo-core';
import { qpqWebServerUtils, RouteQPQWebServerConfigSetting } from 'quidproquo-webserver';

import { EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessMatchStory = (qpqConfig: QPQConfig): ProcessorFor<typeof askEventMatchStoryBase> => {
  const routes: RouteQPQWebServerConfigSetting[] = qpqWebServerUtils.getAllRoutes(qpqConfig);

  return async ({ qpqEventRecord: rawQpqEventRecord }) => {
    // Registered for one event source only, so the base requester's
    // source-agnostic payload is narrowed to this source's types here.
    const qpqEventRecord = rawQpqEventRecord as InternalEventRecord;

    // Sort the routes by string length
    // Note: We may need to filter variable routes out {} as the variables are length independent
    const sortedRoutes = routes
      .filter((r: any) => r.method === qpqEventRecord.method || qpqEventRecord.method === 'OPTIONS')
      .sort((a: any, b: any) => {
        if (a.path.length < b.path.length) return -1;
        if (a.path.length > b.path.length) return 1;
        return 0;
      });

    // Find the most relevant match
    const matchedRoute = sortedRoutes
      .map((r) => ({
        match: awsLambdaUtils.matchUrl(r.path, qpqEventRecord.path),
        route: r,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedRoute) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `route not found [${qpqEventRecord.path}] - [${qpqWebServerUtils.getHeaderValue('user-agent', qpqEventRecord.headers)}]`,
      );
    }

    return actionResult<MatchResult>({
      runtime: matchedRoute.route.runtime,
      runtimeOptions: matchedRoute.match.params || {},

      // TODO: Make this aware of the API that we are eventing
      config: qpqWebServerUtils.mergeAllRouteOptions('api', matchedRoute.route, qpqConfig),
    });
  };
};

export const getEventMatchStoryActionProcessor = createActionProcessor(askEventMatchStoryBase, getProcessMatchStory);
