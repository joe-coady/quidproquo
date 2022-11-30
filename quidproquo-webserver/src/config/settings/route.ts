import { QPQConfigSetting } from 'quidproquo-core';

import { HTTPMethod } from '../../types/HTTPEvent';
import { QPQWebServerConfigSettingType } from '../QPQConfig';

export type RouteOptions = {};

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

  method,
  path,
  src,
  runtime,
  options,
});
