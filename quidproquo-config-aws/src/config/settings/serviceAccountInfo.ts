import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { ServiceAccountInfo } from '../../types';

import { QPQAwsConfigSettingType } from '../QPQConfig';

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
): AwsServiceAccountInfoQPQConfigSetting => {
  console.log('ASDSDASD', QPQAwsConfigSettingType.awsServiceAccountInfo);

  return {
    configSettingType: QPQAwsConfigSettingType.awsServiceAccountInfo,
    uniqueKey: 'AwsServiceAccountInfo',

    deployAccountId,
    deployRegion,

    serviceInfoMap: serviceInfoMap ?? [],
  };
};
