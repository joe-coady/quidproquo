import { QPQConfigSetting, HTTPMethod } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface ApiKey {
  name: string;
  value: string;
}
export interface RouteAuthSettings {
  userDirectoryName?: string;

  applicationName?: string;
  serviceName?: string;

  scopes?: string[];

  apiKeys?: ApiKey[];
}

export type RouteOptions = {
  allowedOrigins?: string[];

  routeAuthSettings?: RouteAuthSettings;
};

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
  options: RouteOptions = {},
): RouteQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Route,
  uniqueKey: runtime,

  method,
  path,
  src,
  runtime,
  options,
});
