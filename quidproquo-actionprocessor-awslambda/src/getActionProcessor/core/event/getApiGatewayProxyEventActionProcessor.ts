import { EventActionTypeEnum, QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { RouteQPQWebServerConfigSetting, HTTPEventParams, qpqWebServerUtils } from 'quidproquo-webserver';

import { randomGuid, matchUrl } from '../../../awsLambdaUtils';

const getProcessTransformEventParams = (appName: string) => {
  return async (payload: any, session: any): Promise<HTTPEventParams<any>> => {
    const {
      params: [event],
    } = payload;
    const path = (event.path || '').replace(new RegExp(`^(\/${appName})/`), '/');
    return {
      path,
      query: {
        ...(event.multiValueQueryStringParameters || {}),
        ...(event.queryStringParameters || {}),
      } as { [key: string]: undefined | string | string[] },
      body: event.body ? JSON.parse(event.body) : undefined,
      headers: event.headers || {},
      method: event.httpMethod as 'GET' | 'POST',
      correlation: randomGuid(),
    };
  };
};

const getProcessTransformResponseResult = (domainName: string) => {
  return async (payload: any, session: any) => ({
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
  return async (payload: any, session: any) => {
    if (payload.http === 'OPTIONS') {
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

const getProcessMatch = (routes: RouteQPQWebServerConfigSetting[]) => async (payload: any, session: any) => {
  // Sort the routes by string length
  // Note: We may need to filter variable routes out {} as the variables are length independent
  const sortedRoutes = routes
    .filter((r: any) => r.method === payload.method)
    .sort((a: any, b: any) => {
      if (a.path.length < b.path.length) return -1;
      if (a.path.length > b.path.length) return 1;
      return 0;
    });

  // Find the most relevant match
  const route = sortedRoutes.find((r) => matchUrl(r.path, payload.path).matches)?.route;

  return route;
};

export default (config: QPQConfig) => {
  const routes = qpqWebServerUtils.getAllRoutes(config);
  const appName = qpqCoreUtils.getAppName(config);
  const domainName = qpqWebServerUtils.getDomainName(config);

  return {
    [EventActionTypeEnum.TransformEventParams]: getProcessTransformEventParams(appName),
    [EventActionTypeEnum.TransformResponseResult]: getProcessTransformResponseResult(domainName),
    [EventActionTypeEnum.AutoRespond]: getProcessAutoRespond(domainName),
    [EventActionTypeEnum.MatchStory]: getProcessMatch(routes),
  };
};
