import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  qpqCoreUtils,
  HTTPMethod,
  EventResolveCaughtErrorActionProcessor,
} from 'quidproquo-core';

import { HTTPEvent, HTTPEventResponse, HttpEventHeaders, RouteQPQWebServerConfigSetting, qpqWebServerUtils } from 'quidproquo-webserver';

import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { parseMultipartFormData } from './utils/parseMultipartFormData';
import { isAuthValid } from './utils/isAuthValid';
import { matchUrl } from '../../../awsLambdaUtils';

type AnyHTTPEvent = HTTPEvent<any>;
type AnyHTTPEventResponse = HTTPEventResponse<any>;

// Externals
type EventInput = [APIGatewayEvent, Context];
type EventOutput = APIGatewayProxyResult;

// Internals
type InternalEventInput = AnyHTTPEvent;
type InternalEventOutput = AnyHTTPEventResponse;

type AutoRespondResult = HTTPEventResponse | false;
type MatchResult = MatchStoryResult<any, any>;

const transformHttpEventHeadersToAPIGatewayProxyResultHeaders = (
  headers: HttpEventHeaders,
): {
  [header: string]: boolean | number | string;
} => {
  return Object.keys(headers)
    .filter((header) => !!headers[header])
    .reduce((acc, header) => ({ ...acc, [header]: headers[header] }), {});
};

const getProcessTransformEventParams = (qpqConfig: QPQConfig): EventTransformEventParamsActionProcessor<EventInput, InternalEventInput> => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async ({ eventParams: [apiGatewayEvent, context] }) => {
    // Initialize `path` by removing the service name prefix from `apiGatewayEvent.path`.
    // This adjustment is necessary because the API gateway routes requests to services based on
    // a base path that includes the service name. By subtracting `serviceName.length + 1` from the
    // substring method's start index, we effectively strip the leading `/<serviceName>` segment,
    // accounting for the leading slash. This ensures `path` reflects the intended resource location
    // after the service name. Defaults to '/' if `apiGatewayEvent.path` is not provided.
    const path = (apiGatewayEvent.path || '/').substring(serviceName.length + 1);

    const transformedEventParams: HTTPEvent<any> = {
      path,
      query: {
        ...(apiGatewayEvent.multiValueQueryStringParameters || {}),
        ...(apiGatewayEvent.queryStringParameters || {}),
      } as { [key: string]: undefined | string | string[] },
      body: apiGatewayEvent.body,
      headers: apiGatewayEvent.headers,
      method: apiGatewayEvent.httpMethod as HTTPMethod,
      correlation: context.awsRequestId,
      sourceIp: apiGatewayEvent.requestContext.identity.sourceIp,
      isBase64Encoded: apiGatewayEvent.isBase64Encoded,
    };

    // Transform the body if its a multipart/form-data
    if ((qpqWebServerUtils.getHeaderValue('Content-Type', apiGatewayEvent.headers) || '').startsWith('multipart/form-data') && apiGatewayEvent.body) {
      transformedEventParams.files = await parseMultipartFormData(apiGatewayEvent);
    }

    console.log(JSON.stringify(transformedEventParams, null, 2));

    return actionResult(transformedEventParams);
  };
};

const getProcessAutoRespond = (qpqConfig: QPQConfig): EventAutoRespondActionProcessor<InternalEventInput, MatchResult, AutoRespondResult> => {
  return async (payload) => {
    if (payload.transformedEventParams.method === 'OPTIONS') {
      return actionResult({
        status: 200,
        isBase64Encoded: false,
        body: '',
        headers: qpqWebServerUtils.getCorsHeaders(qpqConfig, payload.matchResult.config || {}, payload.transformedEventParams.headers),
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
        headers: qpqWebServerUtils.getCorsHeaders(qpqConfig, payload.matchResult.config || {}, payload.transformedEventParams.headers),
      });
    }

    return actionResult(false);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<InternalEventOutput, InternalEventInput, EventOutput> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    // Add the cors headers
    const headers: HttpEventHeaders = {
      ...qpqWebServerUtils.getCorsHeaders(qpqConfig, {}, payload.transformedEventParams.headers),
      ...(payload?.response?.headers || {}),
    };

    // Transform back to api gateway
    return actionResult<APIGatewayProxyResult>({
      statusCode: payload.response.status,
      body: payload.transformedEventParams.method === 'HEAD' || !payload.response.body ? '' : payload.response.body,
      isBase64Encoded: payload.response.isBase64Encoded,
      headers: transformHttpEventHeadersToAPIGatewayProxyResultHeaders(headers),
    });
  };
};

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  const routes: RouteQPQWebServerConfigSetting[] = qpqWebServerUtils.getAllRoutes(qpqConfig);

  return async (payload) => {
    // Sort the routes by string length
    // Note: We may need to filter variable routes out {} as the variables are length independent
    const routesWithNoOptions = routes.filter(
      (r: any) =>
        r.method === payload.transformedEventParams.method ||
        payload.transformedEventParams.method === 'OPTIONS' ||
        (payload.transformedEventParams.method === 'HEAD' && r.method === 'GET'),
    );

    const sortedRoutes = qpqWebServerUtils.sortPathMatchConfigs(routesWithNoOptions);

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
        `route not found [${payload.transformedEventParams.path}] - [${qpqWebServerUtils.getHeaderValue(
          'user-agent',
          payload.transformedEventParams.headers,
        )}]`,
      );
    }

    return actionResult({
      src: matchedRoute.route.src,
      runtime: matchedRoute.route.runtime,
      runtimeOptions: matchedRoute.match.params || {},

      // TODO: Make this aware of the API that we are eventing
      config: qpqWebServerUtils.mergeAllRouteOptions('api', matchedRoute.route, qpqConfig),
    });
  };
};

const getProcessResolveCaughtError = (qpqConfig: QPQConfig): EventResolveCaughtErrorActionProcessor<InternalEventOutput> => {
  const ErrorTypeHttpResponseMap: Record<string, number> = {
    [ErrorTypeEnum.BadRequest]: 400,
    [ErrorTypeEnum.Unauthorized]: 401,
    [ErrorTypeEnum.PaymentRequired]: 402,
    [ErrorTypeEnum.Forbidden]: 403,
    [ErrorTypeEnum.NotFound]: 404,
    [ErrorTypeEnum.TimeOut]: 408,
    [ErrorTypeEnum.Conflict]: 409,
    [ErrorTypeEnum.UnsupportedMediaType]: 415,
    [ErrorTypeEnum.OutOfResources]: 500,
    [ErrorTypeEnum.GenericError]: 500,
    [ErrorTypeEnum.NotImplemented]: 501,
    [ErrorTypeEnum.NoContent]: 204,
    [ErrorTypeEnum.Invalid]: 422,
  };

  return async (payload) => {
    const statusCode = ErrorTypeHttpResponseMap[payload.error.errorType] || 500;
    return actionResult(
      qpqWebServerUtils.toJsonEventResponse(
        {
          errorType: payload.error.errorType,
          errorText: payload.error.errorText,
        },
        statusCode,
      ),
    );
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(qpqConfig),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
    [EventActionType.ResolveCaughtError]: getProcessResolveCaughtError(qpqConfig),
  };
};
