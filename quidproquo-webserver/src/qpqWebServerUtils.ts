import { QPQConfig, qpqCoreUtils } from "quidproquo-core";

import { RouteQPQWebServerConfigSetting } from "./config/settings/route";
import { QPQWebServerConfigSettingType } from "./config/QPQConfig";

// Used in bundlers to know where and what to build and index
// Events, routes, etc
export const getAllSrcEntries = (configs: QPQConfig): string[] => {
  const routes = qpqCoreUtils.getConfigSettings<RouteQPQWebServerConfigSetting>(
    configs,
    QPQWebServerConfigSettingType.Route
  );

  return routes.map((r) => r.src);
};
