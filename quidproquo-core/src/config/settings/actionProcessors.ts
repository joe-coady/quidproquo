import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

export interface ActionProcessorsQPQConfigSetting extends QPQConfigSetting {
  src: string;
}

export const defineActionProcessors = (
  name: string,
  src: string,
): ActionProcessorsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.actionProcessors,
  uniqueKey: name,

  src,
});
