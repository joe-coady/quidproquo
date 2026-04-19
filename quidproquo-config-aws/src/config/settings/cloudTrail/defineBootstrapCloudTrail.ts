import { QPQConfigSetting } from 'quidproquo-core';

import { QPQAwsConfigSettingType } from '../../QPQConfig';

export interface BootstrapCloudTrailQPQConfigSetting extends QPQConfigSetting {
  name: string;
  retentionDays?: number;
  enableLogFileValidation?: boolean;
  multiRegion?: boolean;
  includeGlobalServiceEvents?: boolean;
  cloudWatchLogs?: { retentionDays?: number };
}

export const defineBootstrapCloudTrail = (
  name: BootstrapCloudTrailQPQConfigSetting['name'],
  options?: Omit<BootstrapCloudTrailQPQConfigSetting, 'configSettingType' | 'uniqueKey' | 'name'>,
): BootstrapCloudTrailQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.bootstrapCloudTrail,
  uniqueKey: name,

  name,
  retentionDays: options?.retentionDays,
  enableLogFileValidation: options?.enableLogFileValidation,
  multiRegion: options?.multiRegion,
  includeGlobalServiceEvents: options?.includeGlobalServiceEvents,
  cloudWatchLogs: options?.cloudWatchLogs,
});
