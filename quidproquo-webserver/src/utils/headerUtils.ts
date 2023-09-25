import { QPQConfig } from 'quidproquo-core';

import { HttpEventHeaders } from '../types/HTTPEvent';
import { RouteOptions, ServiceAllowedOrigin } from '../config/settings/route';

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

export const convertContentSecurityPolicyEntryToString = (
  baseDomain: string,
  allowedOrigin: ServiceAllowedOrigin | string,
): string => {
  if (typeof allowedOrigin === 'string') {
    return allowedOrigin;
  }

  // Otherwise its a QpqServiceContentSecurityPolicy
  const domain = allowedOrigin.domain || baseDomain;

  const protocol = allowedOrigin.protocol || 'https';

  if (allowedOrigin.service) {
    return `${protocol}://${allowedOrigin.api}.${allowedOrigin.service}.${domain}`;
  }

  return `${protocol}://${allowedOrigin.api}.${domain}`;
};

export const getAllowedOrigins = (qpqConfig: QPQConfig, route: RouteOptions): string[] => {
  const baseDomain = getBaseDomainName(qpqConfig);
  // Root domain
  const rootDomain = `https://${baseDomain}`;

  // generic settings
  const defaultRouteSettings = qpqWebServerUtils.getDefaultRouteSettings(qpqConfig);

  const defaultAllowedOrigins = defaultRouteSettings.reduce(
    (acc, cur) => [...acc, ...(cur.routeOptions.allowedOrigins || []).map(ao => convertContentSecurityPolicyEntryToString(baseDomain, ao))],
    [] as string[],
  );

  // Route specific
  const routeAllowedOrigins = (route.allowedOrigins || []).map(ao => convertContentSecurityPolicyEntryToString(baseDomain, ao));

  // Return the allowed origins
  const allAllowedOrigins = [
    rootDomain,
    ...defaultAllowedOrigins,
    ...routeAllowedOrigins
  ].map((o) => o.toLowerCase());

  console.log(allAllowedOrigins);

  return allAllowedOrigins;
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
