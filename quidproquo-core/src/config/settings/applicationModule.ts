import { QPQConfig, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { defineApplication } from './applicationName';
import { defineModule } from './moduleName';

export interface ApplicationModuleQPQConfigSetting extends QPQConfigSetting {
  applicationName: string;
  moduleName: string;
  configRoot: string;
  environment?: string;
  deployRegion?: string;
  feature?: string;
}

export const defineApplicationModule = (
  applicationName: string,
  moduleName: string,
  environment: string,
  configRoot: string,
  deployRegion?: string,
  feature?: string,
): QPQConfig => [
  defineApplication(applicationName, environment, configRoot, deployRegion, feature),
  defineModule(moduleName),
];
