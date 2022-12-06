import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { RouteQPQWebServerConfigSetting } from './config/settings/route';
import { DnsQPQWebServerConfigSetting } from './config/settings/dns';
import { OpenApiQPQWebServerConfigSetting } from './config/settings/openApi';
import { QPQWebServerConfigSettingType } from './config/QPQConfig';

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

// Used in bundlers to know where and what to build and index
// Events, routes, etc
export const getDomainName = (configs: QPQConfig): string => {
  const dnsSettings = qpqCoreUtils.getConfigSetting<DnsQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Dns,
  );

  return dnsSettings?.dnsBase || '';
};
