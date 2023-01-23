import { QPQConfigSetting } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface OpenApiQPQWebServerConfigSetting extends QPQConfigSetting {
  openApiSpecPath: string;
}

export const defineOpenApi = (openApiSpecPath: string): OpenApiQPQWebServerConfigSetting => {
  return {
    configSettingType: QPQWebServerConfigSettingType.OpenApi,
    uniqueKey: openApiSpecPath,

    openApiSpecPath,
  };
};
