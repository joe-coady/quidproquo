import {
  EventActionTypeEnum,
  QPQConfig,
  qpqCoreUtils,
  EventTransformEventParamsActionPayload,
  EventTransformResponseResultActionPayload,
  EventMatchStoryActionPayload,
  EventAutoRespondActionPayload,
  StorySession,
} from 'quidproquo-core';

import {
  RouteQPQWebServerConfigSetting,
  HTTPEventParams,
  qpqWebServerUtils,
} from 'quidproquo-webserver';

import { APIGatewayEvent, Context } from 'aws-lambda';

import { matchUrl } from '../../../awsLambdaUtils';

const getProcessTransformEventParams = (appName: string) => {
  return async (
    payload: EventTransformEventParamsActionPayload<[APIGatewayEvent, Context]>,
    session: StorySession,
  ): Promise<HTTPEventParams<any>> => {
    const [apiGatewayEvent, context] = payload.eventParams;

    const path = (apiGatewayEvent.path || '').replace(new RegExp(`^(\/${appName})/`), '/');
    return {
      path,
      query: {
        ...(apiGatewayEvent.multiValueQueryStringParameters || {}),
        ...(apiGatewayEvent.queryStringParameters || {}),
      } as { [key: string]: undefined | string | string[] },
      body: apiGatewayEvent.body ? JSON.parse(apiGatewayEvent.body) : undefined,
      headers: apiGatewayEvent.headers,
      method: apiGatewayEvent.httpMethod as 'GET' | 'POST',
      correlation: context.awsRequestId,
    };
  };
};

const getProcessTransformResponseResult = (domainName: string) => {
  return async (payload: EventTransformResponseResultActionPayload, session: StorySession) => ({
    statusCode: payload.response.result.statusCode,
    body: payload.response.result.body,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': `https://${domainName}`,
    },
  });
};

const getProcessAutoRespond = (domainName: string) => {
  return async (
    payload: EventAutoRespondActionPayload<HTTPEventParams<any>>,
    session: StorySession,
  ) => {
    if (payload.transformedEventParams.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': `https://${domainName}`,
        },
      };
    }

    return null;
  };
};

const getProcessMatchStory =
  (routes: RouteQPQWebServerConfigSetting[]) =>
  async (
    payload: EventMatchStoryActionPayload<HTTPEventParams<any>>,
    session: StorySession,
  ): Promise<RouteQPQWebServerConfigSetting | undefined> => {
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
    return sortedRoutes.find((r) => matchUrl(r.path, payload.transformedEventParams.path).didMatch);
  };

export default (config: QPQConfig) => {
  const routes = qpqWebServerUtils.getAllRoutes(config);
  const appName = qpqCoreUtils.getAppName(config);
  const domainName = qpqWebServerUtils.getDomainName(config);

  return {
    [EventActionTypeEnum.TransformEventParams]: getProcessTransformEventParams(appName),
    [EventActionTypeEnum.TransformResponseResult]: getProcessTransformResponseResult(domainName),
    [EventActionTypeEnum.AutoRespond]: getProcessAutoRespond(domainName),
    [EventActionTypeEnum.MatchStory]: getProcessMatchStory(routes),
  };
};
