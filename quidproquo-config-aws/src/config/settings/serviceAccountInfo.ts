import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from 'quidproquo-core';

import { ServiceAccountInfo } from '../../types';

export interface QPQConfigAdvancedAwsServiceAccountInfoSettings extends QPQConfigAdvancedSettings {}

export interface AwsServiceAccountInfoQPQConfigSetting extends QPQConfigSetting {
  deployAccountId: string;
  deployRegion: string;

  serviceInfoMap: ServiceAccountInfo[];
}

export const defineAwsServiceAccountInfo = (
  deployAccountId: string,
  deployRegion: string,

  serviceInfoMap?: ServiceAccountInfo[],
  options?: QPQConfigAdvancedAwsServiceAccountInfoSettings,
): AwsServiceAccountInfoQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.eventBus,
  uniqueKey: 'AwsServiceAccountInfo',

  deployAccountId,
  deployRegion,

  serviceInfoMap: serviceInfoMap ?? [],
});
