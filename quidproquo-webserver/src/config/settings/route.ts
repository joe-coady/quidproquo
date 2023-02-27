import { QPQConfigSetting, HTTPMethod } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

import { ApiKeyReference } from './apiKey';

interface GenericRouteAuthSettings<T> {
  userDirectoryName?: string;

  applicationName?: string;
  serviceName?: string;

  scopes?: string[];

  apiKeys?: T[];
}

interface GenericRouteOptions<T> {
  allowedOrigins?: string[];

  routeAuthSettings?: GenericRouteAuthSettings<T>;
}

// TODO: Probably clean up the types here
// The idea is just so we can let the user define apiKeys as strings not objects
// But let the internal logic always use objects
export type RouteAuthSettings = GenericRouteAuthSettings<ApiKeyReference>;
export type RouteOptions = GenericRouteOptions<ApiKeyReference>;

export interface RouteQPQWebServerConfigSetting extends QPQConfigSetting {
  method: HTTPMethod;
  path: string;
  src: string;
  runtime: string;
  options: RouteOptions;
}

export const defineRoute = (
  method: HTTPMethod,
  path: string,
  src: string,
  runtime: string,
  options: GenericRouteOptions<ApiKeyReference | string> = {},
): RouteQPQWebServerConfigSetting => {
  const routeAuthSettings = options.routeAuthSettings || {};
  const apiKeys = routeAuthSettings.apiKeys || [];
  const newOptions = {
    ...options,
    routeAuthSettings: {
      ...routeAuthSettings,
      apiKeys: apiKeys.map((apiKey) => (typeof apiKey === 'string' ? { name: apiKey } : apiKey)),
    },
  };

  return {
    configSettingType: QPQWebServerConfigSettingType.Route,
    uniqueKey: runtime,

    method,
    path,
    src,
    runtime,
    options: newOptions,
  };
};
