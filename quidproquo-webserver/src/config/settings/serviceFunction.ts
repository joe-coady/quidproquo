import { QPQConfigSetting, QPQConfigAdvancedSettings, QpqFunctionRuntime, qpqCoreUtils } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedServiceFunctionSettings extends QPQConfigAdvancedSettings {
  functionName?: string;
  virtualNetworkName?: string;
}

export interface ServiceFunctionQPQWebServerConfigSetting extends QPQConfigSetting {
  runtime: QpqFunctionRuntime;

  functionName: string;
  virtualNetworkName?: string;
}

export const defineServiceFunction = (
  runtime: QpqFunctionRuntime,
  options?: QPQConfigAdvancedServiceFunctionSettings,
): ServiceFunctionQPQWebServerConfigSetting => {
  const functionName = options?.functionName || qpqCoreUtils.getStoryNameFromQpqFunctionRuntime(runtime);

  return {
    configSettingType: QPQWebServerConfigSettingType.ServiceFunction,
    uniqueKey: functionName,

    runtime,

    functionName: functionName,

    virtualNetworkName: options?.virtualNetworkName,
  };
};
