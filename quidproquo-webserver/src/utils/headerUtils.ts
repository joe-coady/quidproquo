import { askMap, AskResponse, askThrowError, ErrorTypeEnum, QPQConfig } from 'quidproquo-core';

import { RouteOptions, ServiceAllowedOrigin } from '../config/settings/route';
import { qpqHeaderIsBot, SeoEvent } from '../types';
import { HTTPEvent, HttpEventHeaders } from '../types/HTTPEvent';
import { getBaseDomainName, getDefaultRouteSettings } from './qpqConfigAccessorsUtils';

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
  const defaultRouteSettings = getDefaultRouteSettings(qpqConfig);

  const defaultAllowedOrigins = defaultRouteSettings.reduce(
    (acc, cur) => [...acc, ...(cur.routeOptions.allowedOrigins || []).map((ao) => convertContentSecurityPolicyEntryToString(baseDomain, ao))],
    [] as string[],
  );

  // Route specific
  const routeAllowedOrigins = (route.allowedOrigins || []).map((ao) => convertContentSecurityPolicyEntryToString(baseDomain, ao));

  // Return the allowed origins
  const allAllowedOrigins = [rootDomain, ...defaultAllowedOrigins, ...routeAllowedOrigins].map((o) => o.toLowerCase());

  return allAllowedOrigins;
};

export const getCorsHeaders = (qpqConfig: QPQConfig, route: RouteOptions, reqHeaders: HttpEventHeaders): HttpEventHeaders => {
  const origin = getHeaderValue('origin', reqHeaders) || '';

  const allowedOrigins = getAllowedOrigins(qpqConfig, route);

  const allowCredentials = !!route.routeAuthSettings?.userDirectoryName;

  // If we have an auth endpoint, then we don't let wildcard origins access the API for security reasons
  const allowOrigin =
    (!allowCredentials ? allowedOrigins.find((ao) => origin === ao || ao === '*') : allowedOrigins.find((ao) => origin === ao)) || allowedOrigins[0];

  // Reflect exactly what the preflight asks for instead of a blanket '*'. A
  // literal '*' is invalid once credentials are allowed (browsers reject it),
  // so echoing the requested headers/method keeps authenticated routes working
  // while staying scoped to the real request. The security boundary is the
  // origin check above; these two just describe what that trusted origin may send.
  const requestedHeaders = getHeaderValue('access-control-request-headers', reqHeaders);
  const requestedMethod = getHeaderValue('access-control-request-method', reqHeaders);

  return {
    'Access-Control-Allow-Headers': requestedHeaders || 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': requestedMethod || 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': `${allowCredentials}`,
    Vary: 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method',
  };
};

export const isBot = (event: HTTPEvent | SeoEvent<any>): boolean => {
  return event.headers[qpqHeaderIsBot] === 'true';
};
