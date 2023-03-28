import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedServiceFunctionSettings extends QPQConfigAdvancedSettings {
  functionName?: string;
}

export interface ServiceFunctionQPQWebServerConfigSetting extends QPQConfigSetting {
  src: string;
  runtime: string;

  buildPath: string;
  functionName: string;
}

export const defineServiceFunction = (
  buildPath: string,
  src: string,
  runtime: string,
  options?: QPQConfigAdvancedServiceFunctionSettings,
): ServiceFunctionQPQWebServerConfigSetting => {
  const functionName = options?.functionName || runtime;
  return {
    configSettingType: QPQWebServerConfigSettingType.ServiceFunction,
    uniqueKey: functionName,

    buildPath,

    src,
    runtime,

    functionName: functionName,
  };
};
