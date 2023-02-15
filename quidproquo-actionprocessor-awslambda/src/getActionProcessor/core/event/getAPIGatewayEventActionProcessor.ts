import {
  EventActionType,
  QPQConfig,
  qpqCoreUtils,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
} from 'quidproquo-core';

import {
  RouteQPQWebServerConfigSetting,
  HTTPEventParams,
  qpqWebServerUtils,
} from 'quidproquo-webserver';

import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

import { matchUrl } from '../../../awsLambdaUtils';

const getProcessTransformEventParams = (
  serviceName: string,
): EventTransformEventParamsActionProcessor<[APIGatewayEvent, Context], HTTPEventParams<any>> => {
  return async ({ eventParams: [apiGatewayEvent, context] }) => {
    const path = (apiGatewayEvent.path || '').replace(new RegExp(`^(\/${serviceName})/`), '/');

    return actionResult({
      path,
      query: {
        ...(apiGatewayEvent.multiValueQueryStringParameters || {}),
        ...(apiGatewayEvent.queryStringParameters || {}),
      } as { [key: string]: undefined | string | string[] },
      body: apiGatewayEvent.body,
      headers: apiGatewayEvent.headers,
      method: apiGatewayEvent.httpMethod as 'GET' | 'POST',
      correlation: context.awsRequestId,
      sourceIp: apiGatewayEvent.requestContext.identity.sourceIp,
      isBase64Encoded: apiGatewayEvent.isBase64Encoded,
    });
  };
};

const getProcessTransformResponseResult = (
  configs: QPQConfig,
  // TODO: Remove the anys here for a HttpResponse type
): EventTransformResponseResultActionProcessor<any, any, APIGatewayProxyResult> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    return actionResult<APIGatewayProxyResult>({
      statusCode: payload.response.status,
      body: payload.response.body,
      isBase64Encoded: payload.response.isBase64Encoded,
      headers: {
        ...qpqWebServerUtils.getCorsHeaders(configs, {}, payload.transformedEventParams.headers),
        ...(payload?.response?.headers || {}),
      },
    });
  };
};

const getProcessAutoRespond = (
  configs: QPQConfig,
): EventAutoRespondActionProcessor<HTTPEventParams<any>> => {
  return async (payload) => {
    if (payload.transformedEventParams.method === 'OPTIONS') {
      return actionResult({
        result: {
          statusCode: 200,
          headers: qpqWebServerUtils.getCorsHeaders(
            configs,
            {},
            payload.transformedEventParams.headers,
          ),
        },
      });
    }

    return actionResult(null);
  };
};

const getProcessMatchStory = (
  routes: RouteQPQWebServerConfigSetting[],
): EventMatchStoryActionProcessor<HTTPEventParams<any>> => {
  return async (payload) => {
    // Sort the routes by string length
    // Note: We may need to filter variable routes out {} as the variables are length independent
    const sortedRoutes = routes
      .filter((r: any) => r.method === payload.transformedEventParams.method)
      .sort((a: any, b: any) => {
        if (a.path.length < b.path.length) return -1;
        if (a.path.length > b.path.length) return 1;
        return 0;
      });

    // Find the most relevant match
    const matchedRoute = sortedRoutes
      .map((r) => ({
        match: matchUrl(r.path, payload.transformedEventParams.path),
        route: r,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedRoute) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `route not found [${payload.transformedEventParams.path}] - [${payload.transformedEventParams.headers['user-agent']}]`,
      );
    }

    return actionResult<MatchStoryResult>({
      src: matchedRoute.route.src,
      runtime: matchedRoute.route.runtime,
      options: matchedRoute.match.params || {},
    });
  };
};

export default (config: QPQConfig) => {
  const routes = qpqWebServerUtils.getAllRoutes(config);
  const serviceName = qpqCoreUtils.getApplicationModuleName(config);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(serviceName),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(config),
    [EventActionType.AutoRespond]: getProcessAutoRespond(config),
    [EventActionType.MatchStory]: getProcessMatchStory(routes),
  };
};
