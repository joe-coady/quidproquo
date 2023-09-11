import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { QpqSourceEntry } from './queue';

export interface DeployEventsQPQConfigSetting extends QPQConfigSetting {
  name: string,
  buildPath: string;
  src: QpqSourceEntry;
}

export const defineDeployEvent = (
  buildPath: string,
  name: string,
  src: QpqSourceEntry
): DeployEventsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.deployEvent,
  uniqueKey: name,

  buildPath,
  src,
  name
});
