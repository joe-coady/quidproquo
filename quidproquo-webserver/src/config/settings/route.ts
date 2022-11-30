import { QPQConfigSetting } from "quidproquo-core";

import { QPQWebServerConfigSettingType } from "../QPQConfig";

export type HTTPMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "PATCH";

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
  options: RouteOptions = {}
): RouteQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.Route,

  method,
  path,
  src,
  runtime,
  options,
});
