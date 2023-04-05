import * as path from 'path';

import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import {
  ApiKeyQPQWebServerConfigSetting,
  RouteQPQWebServerConfigSetting,
  DnsQPQWebServerConfigSetting,
  SeoQPQWebServerConfigSetting,
  SubdomainRedirectQPQWebServerConfigSetting,
  OpenApiQPQWebServerConfigSetting,
  QPQWebServerConfigSettingType,
  DefaultRouteOptionsQPQWebServerConfigSetting,
  ServiceFunctionQPQWebServerConfigSetting,
} from '../config';

import { WebEntryQPQWebServerConfigSetting, ApiQPQWebServerConfigSetting } from '../config';

export const getAllRoutes = (qpqConfig: QPQConfig): RouteQPQWebServerConfigSetting[] => {
  const routes = qpqCoreUtils.getConfigSettings<RouteQPQWebServerConfigSetting>(
    qpqConfig,
    QPQWebServerConfigSettingType.Route,
  );

  return routes;
};

export const getAllRoutesForApi = (
  apiName: string,
  qpqConfig: QPQConfig,
): RouteQPQWebServerConfigSetting[] => {
  const routes = getAllRoutes(qpqConfig);

  return routes;
};

export const getAllApiKeyConfigs = (qpqConfig: QPQConfig): ApiKeyQPQWebServerConfigSetting[] => {
  const apiKeyConfigs = qpqCoreUtils.getConfigSettings<ApiKeyQPQWebServerConfigSetting>(
    qpqConfig,
    QPQWebServerConfigSettingType.ApiKey,
  );

  return apiKeyConfigs;
};

export const getAllSeo = (qpqConfig: QPQConfig): SeoQPQWebServerConfigSetting[] => {
  const seoConfigs = qpqCoreUtils.getConfigSettings<SeoQPQWebServerConfigSetting>(
    qpqConfig,
    QPQWebServerConfigSettingType.Seo,
  );

  return seoConfigs;
};

export const getAllServiceFunctions = (
  qpqConfig: QPQConfig,
): ServiceFunctionQPQWebServerConfigSetting[] => {
  const serviceFunctions = qpqCoreUtils.getConfigSettings<ServiceFunctionQPQWebServerConfigSetting>(
    qpqConfig,
    QPQWebServerConfigSettingType.ServiceFunction,
  );

  return serviceFunctions;
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
    ...getAllServiceFunctions(configs).map((sf) => sf.src),
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

export const getServiceFunctionFullPath = (
  qpqConfig: QPQConfig,
  serviceFunctionConfig: ServiceFunctionQPQWebServerConfigSetting,
): string => {
  const buildPath = serviceFunctionConfig.buildPath;

  if (!buildPath) {
    throw new Error('please use defineWebEntry in your qpq config');
  }

  return path.join(qpqCoreUtils.getConfigRoot(qpqConfig), buildPath);
};

export const getRedirectApiBuildFullPath = (
  qpqConfig: QPQConfig,
  redirectConfig: SubdomainRedirectQPQWebServerConfigSetting,
): string => {
  const apiEntry = redirectConfig.apiBuildPath;

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
  const environment = qpqCoreUtils.getApplicationModuleEnvironment(configs);
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

export const getDefaultRouteSettings = (
  qpqConfig: QPQConfig,
): DefaultRouteOptionsQPQWebServerConfigSetting[] => {
  const defaultRouteSettings =
    qpqCoreUtils.getConfigSettings<DefaultRouteOptionsQPQWebServerConfigSetting>(
      qpqConfig,
      QPQWebServerConfigSettingType.DefaultRouteOptions,
    ) || [];

  return defaultRouteSettings;
};

export const getDomainRoot = (
  rootDomain: string,
  environment: string,
  feature?: string,
): string => {
  let domainPrefix = environment !== 'production' ? `${environment}.` : '';
  if (feature) {
    domainPrefix = `${feature}.${domainPrefix}`;
  }

  return `${domainPrefix}${rootDomain}`;
};
