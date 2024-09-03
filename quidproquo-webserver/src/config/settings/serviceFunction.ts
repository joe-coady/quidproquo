import { QPQConfigSetting, QPQConfigAdvancedSettings, QpqFunctionRuntime, qpqCoreUtils } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedServiceFunctionSettings extends QPQConfigAdvancedSettings {
  functionName?: string;
}

export interface ServiceFunctionQPQWebServerConfigSetting extends QPQConfigSetting {
  runtime: QpqFunctionRuntime;

  buildPath: string;
  functionName: string;
}

export const defineServiceFunction = (
  buildPath: string,
  runtime: QpqFunctionRuntime,
  options?: QPQConfigAdvancedServiceFunctionSettings,
): ServiceFunctionQPQWebServerConfigSetting => {
  const functionName = options?.functionName || qpqCoreUtils.getStoryNameFromQpqFunctionRuntime(runtime);

  return {
    configSettingType: QPQWebServerConfigSettingType.ServiceFunction,
    uniqueKey: functionName,

    buildPath,

    runtime,

    functionName: functionName,
  };
};
