import { QPQConfig } from 'quidproquo-core';

import { RouteAuthSettings, RouteQPQWebServerConfigSetting } from '../config/settings/route';

import { RouteOptions } from '../config/settings/route';

import { getDefaultRouteSettings } from './qpqConfigAccessorsUtils';

export const mergeRouteAuthSettings = (
  routeAuthSettingsA?: RouteAuthSettings,
  routeAuthSettingsB?: RouteAuthSettings,
): RouteAuthSettings => {
  return {
    applicationName: routeAuthSettingsB?.applicationName || routeAuthSettingsA?.applicationName,
    serviceName: routeAuthSettingsB?.serviceName || routeAuthSettingsA?.serviceName,
    userDirectoryName:
      routeAuthSettingsB?.userDirectoryName || routeAuthSettingsA?.userDirectoryName,
    scopes: [
      ...new Set([...(routeAuthSettingsB?.scopes || []), ...(routeAuthSettingsA?.scopes || [])]),
    ],

    apiKeys: [
      ...new Set([...(routeAuthSettingsB?.apiKeys || []), ...(routeAuthSettingsA?.apiKeys || [])]),
    ],
  };
};

export const mergeRouteOptions = (
  routeOptionsA: RouteOptions,
  routeOptionsB: RouteOptions,
): RouteOptions => {
  return {
    allowedOrigins: [
      ...new Set([
        ...(routeOptionsB.allowedOrigins || []),
        ...(routeOptionsA.allowedOrigins || []),
      ]),
    ],
    routeAuthSettings: mergeRouteAuthSettings(
      routeOptionsA.routeAuthSettings,
      routeOptionsB.routeAuthSettings,
    ),
  };
};

export const mergeAllRouteOptions = (
  activeApi: string,
  routeConfig: RouteQPQWebServerConfigSetting,
  qpqConfig: QPQConfig,
): RouteOptions => {
  // TODO: This needs to filter active route on the current route Config
  // activeApi
  const defaultOptions = getDefaultRouteSettings(qpqConfig).map((o) => o.routeOptions);
  const routeOptions = routeConfig.options;

  return [...defaultOptions, routeOptions].reduce(
    (acc, opt) => mergeRouteOptions(acc, opt),
    {} as RouteOptions,
  );
};
