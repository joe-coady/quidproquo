import { QpqFunctionRuntime } from '../../types';
import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface DeployEventsQPQConfigSetting extends QPQConfigSetting {
  name: string;
  buildPath: string;
  runtime: QpqFunctionRuntime;
}

export const defineDeployEvent = (buildPath: string, name: string, runtime: QpqFunctionRuntime): DeployEventsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.deployEvent,
  uniqueKey: name,

  buildPath,
  runtime,
  name,
});
