import { askMap, AskResponse, askThrowError,ErrorTypeEnum, QPQConfig } from 'quidproquo-core';

import { RouteOptions, ServiceAllowedOrigin } from '../config/settings/route';
import { qpqWebServerUtils } from '../qpqWebServerUtils';
import { qpqHeaderIsBot,SeoEvent } from '../types';
import { HTTPEvent, HttpEventHeaders } from '../types/HTTPEvent';
import { getBaseDomainName } from './qpqConfigAccessorsUtils';

export const getHeaderValue = (header: string, headers: HttpEventHeaders): string | null => {
  const headerAsLower = header.toLowerCase();
  const realHeaderKey = Object.keys(headers).find((k) => k.toLowerCase() === headerAsLower);

  if (!realHeaderKey) {
    return null;
  }

  return headers[realHeaderKey] || null;
};

export function* askReadRequiredHeader(event: HTTPEvent, requiredHeader: string): AskResponse<string> {
  const header = getHeaderValue(requiredHeader, event.headers);
  if (!header) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `Header ${requiredHeader} not found`);
  }

  return header;
}

export function* askReadRequiredHeaders(event: HTTPEvent, requiredHeaders: string[]): AskResponse<string[]> {
  return yield* askMap(requiredHeaders, function* (header: string) {
    return yield* askReadRequiredHeader(event, header);
  });
}

export const getAccessTokenFromHeaders = (headers: HttpEventHeaders): string | undefined => {
  const authorizationHeader = getHeaderValue('authorization', headers) || '';
  const [authType, authToken] = authorizationHeader.split(' ');

  return authToken;
};

export const convertContentSecurityPolicyEntryToString = (baseDomain: string, allowedOrigin: ServiceAllowedOrigin | string): string => {
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
    (acc, cur) => [...acc, ...(cur.routeOptions.allowedOrigins || []).map((ao) => convertContentSecurityPolicyEntryToString(baseDomain, ao))],
    [] as string[],
  );

  // Route specific
  const routeAllowedOrigins = (route.allowedOrigins || []).map((ao) => convertContentSecurityPolicyEntryToString(baseDomain, ao));

  // Return the allowed origins
  const allAllowedOrigins = [rootDomain, ...defaultAllowedOrigins, ...routeAllowedOrigins].map((o) => o.toLowerCase());

  console.log(allAllowedOrigins);

  return allAllowedOrigins;
};

export const getCorsHeaders = (qpqConfig: QPQConfig, route: RouteOptions, reqHeaders: HttpEventHeaders): HttpEventHeaders => {
  const origin = getHeaderValue('origin', reqHeaders) || '';
  console.log('origin', origin);

  const allowedOrigins = getAllowedOrigins(qpqConfig, route);
  console.log('allowedOrigins', allowedOrigins);

  const allowCredentials = !!route.routeAuthSettings?.userDirectoryName;
  console.log('allowCredentials', allowCredentials);

  // If we have an auth endpoint, then we don't let wildcard origins access the API for security reasons
  const allowOrigin =
    (!allowCredentials ? allowedOrigins.find((ao) => origin === ao || ao === '*') : allowedOrigins.find((ao) => origin === ao)) || allowedOrigins[0];

  console.log('allowOrigin', allowOrigin);

  return {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': `${allowCredentials}`,
    Vary: 'Origin',
  };
};

export const isBot = (event: HTTPEvent | SeoEvent<any>): boolean => {
  return event.headers[qpqHeaderIsBot] === 'true';
};
