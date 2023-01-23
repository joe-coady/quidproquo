import { QPQConfigSetting, HTTPMethod } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export type RouteOptions = {
  allowedOrigins?: string[];
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
  uniqueKey: `${method}${path}`,

  method,
  path,
  src,
  runtime,
  options,
});
