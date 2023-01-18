import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ActionProcessorsQPQConfigSetting extends QPQConfigSetting {
  src: string;
}

export const defineActionProcessors = (src: string): ActionProcessorsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.actionProcessors,

  src,
});
