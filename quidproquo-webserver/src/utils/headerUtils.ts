import { QPQConfig } from 'quidproquo-core';

import { HttpEventHeaders } from '../types/HTTPEvent';
import { RouteOptions } from '../config/settings/route';

import { getBaseDomainName } from './qpqConfigAccessorsUtils';
import { qpqWebServerUtils } from '../qpqWebServerUtils';

export const getHeaderValue = (header: string, headers: HttpEventHeaders): string | null => {
  const headerAsLower = header.toLowerCase();
  const realHeaderKey = Object.keys(headers).find((k) => k.toLowerCase() === headerAsLower);

  if (!realHeaderKey) {
    return null;
  }

  return headers[realHeaderKey] || null;
};

export const getAccessTokenFromHeaders = (headers: HttpEventHeaders): string | undefined => {
  const authorizationHeader = getHeaderValue('authorization', headers) || '';
  const [authType, authToken] = authorizationHeader.split(' ');

  return authToken;
};

export const getAllowedOrigins = (qpqConfig: QPQConfig, route: RouteOptions): string[] => {
  // Root domain
  const rootDomain = `https://${getBaseDomainName(qpqConfig)}`;

  // generic settings
  const defaultRouteSettings = qpqWebServerUtils.getDefaultRouteSettings(qpqConfig);

  const defaultAllowedOrigins = defaultRouteSettings.reduce(
    (acc, cur) => [...acc, ...(cur.routeOptions.allowedOrigins || [])],
    [] as string[],
  );

  // Route specific
  const routeAllowedOrigins = route.allowedOrigins || [];

  return [rootDomain, ...defaultAllowedOrigins, ...routeAllowedOrigins].map((o) => o.toLowerCase());
};

export const getCorsHeaders = (
  qpqConfig: QPQConfig,
  route: RouteOptions,
  reqHeaders: HttpEventHeaders,
): HttpEventHeaders => {
  const origin = getHeaderValue('origin', reqHeaders) || '';
  const allowedOrigins = getAllowedOrigins(qpqConfig, route);
  const allowCredentials = !!route.routeAuthSettings?.userDirectoryName;

  // If we have an auth endpoint, then we don't let wildcard origins access the API for security reasons
  const allowOrigin =
    (!allowCredentials
      ? allowedOrigins.find((ao) => origin === ao || ao === '*')
      : allowedOrigins.find((ao) => origin === ao)) || allowedOrigins[0];

  return {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': `${allowCredentials}`,
    Vary: 'Origin',
  };
};
