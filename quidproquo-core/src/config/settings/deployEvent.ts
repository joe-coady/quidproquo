import { QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';
import { QpqSourceEntry } from './queue';

export interface DeployEventsQPQConfigSetting extends QPQConfigSetting {
  buildPath: string;
  src: QpqSourceEntry;
}

export const defineDeployEvent = (
  buildPath: string,
  src: QpqSourceEntry
): DeployEventsQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.deployEvent,
  uniqueKey: 'deployEvent',

  buildPath,
  src
});
