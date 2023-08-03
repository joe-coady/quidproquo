import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { ServiceAccountInfo, ApiLayer } from '../../types';

import { QPQAwsConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedAwsServiceAccountInfoSettings extends QPQConfigAdvancedSettings {
  apiLayers?: ApiLayer[];
  lambdaMaxMemoryInMiB?: number;
}

export interface AwsServiceAccountInfoQPQConfigSetting extends QPQConfigSetting {
  deployAccountId: string;
  deployRegion: string;

  serviceInfoMap: ServiceAccountInfo[];
  apiLayers: ApiLayer[];

  lambdaMaxMemoryInMiB: number;
}

export const defineAwsServiceAccountInfo = (
  deployAccountId: string,
  deployRegion: string,

  serviceInfoMap?: ServiceAccountInfo[],
  options?: QPQConfigAdvancedAwsServiceAccountInfoSettings,
): AwsServiceAccountInfoQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.awsServiceAccountInfo,
  uniqueKey: 'AwsServiceAccountInfo',

  deployAccountId,
  deployRegion,

  serviceInfoMap: serviceInfoMap ?? [],
  apiLayers: options?.apiLayers ?? [],

  lambdaMaxMemoryInMiB: options?.lambdaMaxMemoryInMiB || 1024
});
