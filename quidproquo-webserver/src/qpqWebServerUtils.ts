import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { RouteQPQWebServerConfigSetting } from './config/settings/route';
import { DnsQPQWebServerConfigSetting } from './config/settings/dns';
import { OpenApiQPQWebServerConfigSetting } from './config/settings/openApi';
import { DefaultRouteOptionsQPQWebServerConfigSetting } from './config/settings/defaultRouteOptions';
import { QPQWebServerConfigSettingType } from './config/QPQConfig';
import { getAppFeature } from 'quidproquo-core/lib/qpqCoreUtils';

import { HttpEventHeaders } from './types/HTTPEvent';
import { RouteOptions } from './config/settings/route';

export const getAllRoutes = (configs: QPQConfig): RouteQPQWebServerConfigSetting[] => {
  const routes = qpqCoreUtils.getConfigSettings<RouteQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Route,
  );

  return routes;
};

export const getAllOpenApiSpecs = (configs: QPQConfig): OpenApiQPQWebServerConfigSetting[] => {
  const openApiSpecs = qpqCoreUtils.getConfigSettings<OpenApiQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.OpenApi,
  );

  return openApiSpecs;
};

// Used in bundlers to know where and what to build and index
// Events, routes, etc
export const getAllSrcEntries = (configs: QPQConfig): string[] => {
  return [
    ...getAllRoutes(configs).map((r) => r.src),
    ...getAllOpenApiSpecs(configs).map((r) => r.openApiSpecPath),
  ];
};

export const getDomainName = (configs: QPQConfig): string => {
  const dnsSettings = qpqCoreUtils.getConfigSetting<DnsQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Dns,
  );

  return dnsSettings?.dnsBase || '';
};

export const getFeatureDomainName = (configs: QPQConfig): string => {
  const feature = getAppFeature(configs);
  const apexDomainName = getDomainName(configs);

  if (feature === 'production') {
    return apexDomainName;
  }

  return `${feature}.${apexDomainName}`;
};

export const getHeaderValue = (header: string, headers: HttpEventHeaders): string | null => {
  const headerAsLower = header.toLowerCase();
  const realHeaderKey = Object.keys(headers).find((k) => k.toLowerCase() === headerAsLower);

  if (!realHeaderKey) {
    return null;
  }

  return headers[realHeaderKey] || null;
};

export const getAllowedOrigins = (configs: QPQConfig, route: RouteOptions): string[] => {
  // Root domain
  const rootDomain = `https://${getFeatureDomainName(configs)}`;

  // generic settings
  const defaultRouteSettings =
    qpqCoreUtils.getConfigSettings<DefaultRouteOptionsQPQWebServerConfigSetting>(
      configs,
      QPQWebServerConfigSettingType.DefaultRouteOptions,
    ) || [];
  const defaultAllowedOrigins = defaultRouteSettings.reduce(
    (acc, cur) => [...acc, ...(cur.routeOptions.allowedOrigins || [])],
    [] as string[],
  );

  // Route specific
  const routeAllowedOrigins = route.allowedOrigins || [];

  return [rootDomain, ...defaultAllowedOrigins, ...routeAllowedOrigins].map((o) => o.toLowerCase());
};

export const getCorsHeaders = (
  configs: QPQConfig,
  route: RouteOptions,
  reqHeaders: HttpEventHeaders,
): HttpEventHeaders => {
  const origin = getHeaderValue('origin', reqHeaders) || '';
  const allowedOrigins = getAllowedOrigins(configs, route);
  const allowOrigin = allowedOrigins.find((ao) => ao === origin) || allowedOrigins[0];

  return {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
  };
};
