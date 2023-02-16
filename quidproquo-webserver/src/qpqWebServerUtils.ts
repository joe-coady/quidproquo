import * as path from 'path';

import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { RouteQPQWebServerConfigSetting } from './config/settings/route';
import { DnsQPQWebServerConfigSetting } from './config/settings/dns';
import { SeoQPQWebServerConfigSetting } from './config/settings/seo';
import { SubdomainRedirectQPQWebServerConfigSetting } from './config/settings/subdomainRedirect';
import { OpenApiQPQWebServerConfigSetting } from './config/settings/openApi';
import { DefaultRouteOptionsQPQWebServerConfigSetting } from './config/settings/defaultRouteOptions';
import { QPQWebServerConfigSettingType } from './config/QPQConfig';
import { getApplicationModuleEnvironment } from 'quidproquo-core/lib/qpqCoreUtils';

import { HttpEventHeaders, HTTPEvent, HTTPEventResponse } from './types/HTTPEvent';
import { RouteOptions } from './config/settings/route';
import { WebEntryQPQWebServerConfigSetting, ApiQPQWebServerConfigSetting } from './config';

export const getAllRoutes = (configs: QPQConfig): RouteQPQWebServerConfigSetting[] => {
  const routes = qpqCoreUtils.getConfigSettings<RouteQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Route,
  );

  return routes;
};

export const getAllSeo = (configs: QPQConfig): SeoQPQWebServerConfigSetting[] => {
  const seoConfigs = qpqCoreUtils.getConfigSettings<SeoQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Seo,
  );

  return seoConfigs;
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
    ...getAllSeo(configs).map((seo) => seo.src),
  ];
};

export const getDomainName = (configs: QPQConfig): string => {
  const dnsSettings = qpqCoreUtils.getConfigSetting<DnsQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Dns,
  );

  return dnsSettings?.dnsBase || '';
};

export const getWebEntry = (configs: QPQConfig): string => {
  const webEntry = qpqCoreUtils.getConfigSetting<WebEntryQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.WebEntry,
  );

  if (!webEntry?.buildPath) {
    throw new Error('please use defineWebEntry in your qpq config');
  }

  return webEntry?.buildPath;
};

export const getWebEntryFullPath = (
  qpqConfig: QPQConfig,
  webEntryQPQWebServerConfigSetting: WebEntryQPQWebServerConfigSetting,
): string => {
  return path.join(
    qpqCoreUtils.getConfigRoot(qpqConfig),
    webEntryQPQWebServerConfigSetting.buildPath || '',
  );
};

export const getWebEntrySeoFullPath = (
  qpqConfig: QPQConfig,
  webEntryQPQWebServerConfigSetting: WebEntryQPQWebServerConfigSetting,
): string => {
  return path.join(
    qpqCoreUtils.getConfigRoot(qpqConfig),
    webEntryQPQWebServerConfigSetting.seoBuildPath ||
      webEntryQPQWebServerConfigSetting.buildPath ||
      '',
  );
};

export const getApiEntryFullPath = (
  qpqConfig: QPQConfig,
  apiConfig: ApiQPQWebServerConfigSetting,
): string => {
  const apiEntry = apiConfig.buildPath;

  if (!apiEntry) {
    throw new Error('please use defineWebEntry in your qpq config');
  }

  return path.join(qpqCoreUtils.getConfigRoot(qpqConfig), apiEntry);
};

export const getSubdomainRedirects = (
  configs: QPQConfig,
): SubdomainRedirectQPQWebServerConfigSetting[] => {
  const subdomainRedirects =
    qpqCoreUtils.getConfigSettings<SubdomainRedirectQPQWebServerConfigSetting>(
      configs,
      QPQWebServerConfigSettingType.SubdomainRedirect,
    );

  return subdomainRedirects;
};

export const getApiConfigs = (configs: QPQConfig): ApiQPQWebServerConfigSetting[] => {
  return qpqCoreUtils.getConfigSettings<ApiQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Api,
  );
};

export const getDnsConfigs = (configs: QPQConfig): DnsQPQWebServerConfigSetting[] => {
  return qpqCoreUtils.getConfigSettings<DnsQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Dns,
  );
};

export const getWebEntryConfigs = (configs: QPQConfig): WebEntryQPQWebServerConfigSetting[] => {
  return qpqCoreUtils.getConfigSettings<WebEntryQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.WebEntry,
  );
};

export const getEnvironmentDomainName = (configs: QPQConfig): string => {
  const environment = getApplicationModuleEnvironment(configs);
  const apexDomainName = getDomainName(configs);

  if (environment === 'production') {
    return apexDomainName;
  }

  return `${environment}.${apexDomainName}`;
};

export const getBaseDomainName = (qpqConfig: QPQConfig): string => {
  const environmentDomain = getEnvironmentDomainName(qpqConfig);
  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);

  if (feature) {
    return `${feature}.${environmentDomain}`;
  }

  return environmentDomain;
};

export const getServiceDomainName = (qpqConfig: QPQConfig): string => {
  const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  const domainBase = getBaseDomainName(qpqConfig);

  return `${service}.${domainBase}`;
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
  const rootDomain = `https://${getBaseDomainName(configs)}`;

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
    'Access-Control-Allow-Credentials': `${!!route.routeAuthSettings}`,
    Vary: 'Origin',
  };
};

export const fromJsonEventRequest = <T>(httpJsonEvent: HTTPEvent): T => {
  const item: T = JSON.parse(
    httpJsonEvent.isBase64Encoded
      ? Buffer.from(httpJsonEvent.body, 'base64').toString()
      : httpJsonEvent.body,
  );

  return item;
};

export const toJsonEventResponse = (item: any, status: number = 200): HTTPEventResponse => {
  return {
    status,
    body: JSON.stringify(item),
    isBase64Encoded: false,
    headers: {
      'content-type': 'application/json',
    },
  };
};
