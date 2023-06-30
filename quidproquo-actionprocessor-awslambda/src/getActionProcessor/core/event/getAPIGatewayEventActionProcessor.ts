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
  QPQBinaryData,
} from 'quidproquo-core';

import {
  RouteQPQWebServerConfigSetting,
  HTTPEvent,
  HTTPEventResponse,
  HttpEventHeaders,
  qpqWebServerUtils,
  HttpEventRouteParams,
  RouteOptions,
} from 'quidproquo-webserver';

import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

import { matchUrl } from '../../../awsLambdaUtils';

import { isAuthValid } from './utils/isAuthValid';
import { parseMultipartFormData } from './utils/parseMultipartFormData';

export type HttpRouteMatchStoryResult = MatchStoryResult<HttpEventRouteParams, RouteOptions>;
export type ApiGatewayEventParams = [APIGatewayEvent, Context];

const transformHttpEventHeadersToAPIGatewayProxyResultHeaders = (
  headers: HttpEventHeaders,
): {
  [header: string]: boolean | number | string;
} => {
  return Object.keys(headers)
    .filter((header) => !!headers[header])
    .reduce((acc, header) => ({ ...acc, [header]: headers[header] }), {});
};

const getProcessTransformEventParams = (
  serviceName: string,
): EventTransformEventParamsActionProcessor<ApiGatewayEventParams, HTTPEvent<any>> => {
  return async ({ eventParams: [apiGatewayEvent, context] }) => {
    // The comment here was for when we use base path as our service name, its now in the domain
    const path = apiGatewayEvent.path || '/'; // (apiGatewayEvent.path || '').replace(new RegExp(`^(\/${serviceName})/`), '/');

    const transformedEventParams: HTTPEvent<any> = {
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
    };

    // Transform the body if its a multipart/form-data
    if (
      (qpqWebServerUtils.getHeaderValue('Content-Type', apiGatewayEvent.headers) || '').startsWith(
        'multipart/form-data',
      ) &&
      apiGatewayEvent.body
    ) {
      transformedEventParams.files = await parseMultipartFormData(apiGatewayEvent);
    }

    console.log(JSON.stringify(transformedEventParams, null, 2));

    return actionResult(transformedEventParams);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  HTTPEventResponse<string>,
  HTTPEvent,
  APIGatewayProxyResult
> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    const headers: HttpEventHeaders = {
      ...qpqWebServerUtils.getCorsHeaders(qpqConfig, {}, payload.transformedEventParams.headers),
      ...(payload?.response?.headers || {}),
    };

    return actionResult<APIGatewayProxyResult>({
      statusCode: payload.response.status,
      body: payload.response.body || '',
      isBase64Encoded: payload.response.isBase64Encoded,
      headers: transformHttpEventHeadersToAPIGatewayProxyResultHeaders(headers),
    });
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<
  HTTPEvent<any>,
  HttpRouteMatchStoryResult,
  HTTPEventResponse | null
> => {
  return async (payload) => {
    if (payload.transformedEventParams.method === 'OPTIONS') {
      return actionResult({
        status: 200,
        isBase64Encoded: false,
        body: '',
        headers: qpqWebServerUtils.getCorsHeaders(
          qpqConfig,
          payload.matchResult.config || {},
          payload.transformedEventParams.headers,
        ),
      });
    }

    // TODO: We can pull out the jwt from the session if thats a better way?
    // Think about that when you dont have covid.
    const authValid = await isAuthValid(
      qpqConfig,
      qpqWebServerUtils.getHeaderValue('Authorization', payload.transformedEventParams.headers),
      qpqWebServerUtils.getHeaderValue('x-api-key', payload.transformedEventParams.headers),
      payload.matchResult.config?.routeAuthSettings,
    );

    if (!authValid) {
      return actionResult({
        status: 401,
        isBase64Encoded: false,
        body: JSON.stringify({
          message: 'You are unauthorized to access this resource',
        }),
        headers: qpqWebServerUtils.getCorsHeaders(
          qpqConfig,
          payload.matchResult.config || {},
          payload.transformedEventParams.headers,
        ),
      });
    }

    return actionResult(null);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<HTTPEvent<any>, HttpRouteMatchStoryResult> => {
  const routes: RouteQPQWebServerConfigSetting[] = qpqWebServerUtils.getAllRoutes(qpqConfig);

  return async (payload) => {
    // Sort the routes by string length
    // Note: We may need to filter variable routes out {} as the variables are length independent
    const sortedRoutes = routes
      .filter(
        (r: any) =>
          r.method === payload.transformedEventParams.method ||
          payload.transformedEventParams.method === 'OPTIONS',
      )
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
        `route not found [${
          payload.transformedEventParams.path
        }] - [${qpqWebServerUtils.getHeaderValue(
          'user-agent',
          payload.transformedEventParams.headers,
        )}]`,
      );
    }

    return actionResult<HttpRouteMatchStoryResult>({
      src: matchedRoute.route.src,
      runtime: matchedRoute.route.runtime,
      runtimeOptions: matchedRoute.match.params || {},

      // TODO: Make this aware of the API that we are eventing
      config: qpqWebServerUtils.mergeAllRouteOptions('api', matchedRoute.route, qpqConfig),
    });
  };
};

export default (qpqConfig: QPQConfig) => {
  // TODO: Make this aware of the API that we are eventing
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(serviceName),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
