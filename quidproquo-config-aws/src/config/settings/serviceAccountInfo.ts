import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { ServiceAccountInfo, ApiLayer } from '../../types';

import { QPQAwsConfigSettingType } from '../QPQConfig';

export interface QPQConfigAdvancedAwsServiceAccountInfoSettings extends QPQConfigAdvancedSettings {
  apiLayers?: ApiLayer[];
  lambdaMaxMemoryInMiB?: number;

  logServiceName?: string;

  disableLogs?: boolean;
}

export interface AwsServiceAccountInfoQPQConfigSetting extends QPQConfigSetting {
  deployAccountId: string;
  deployRegion: string;

  logServiceName?: string;

  serviceInfoMap: ServiceAccountInfo[];
  apiLayers: ApiLayer[];

  lambdaMaxMemoryInMiB: number;

  disableLogs: boolean;
  apiBuildPath: string;
}

export const defineAwsServiceAccountInfo = (
  deployAccountId: string,
  deployRegion: string,
  apiBuildPath: string,

  serviceInfoMap?: ServiceAccountInfo[],
  options?: QPQConfigAdvancedAwsServiceAccountInfoSettings,
): AwsServiceAccountInfoQPQConfigSetting => ({
  configSettingType: QPQAwsConfigSettingType.awsServiceAccountInfo,
  uniqueKey: 'AwsServiceAccountInfo',

  deployAccountId,
  deployRegion,

  serviceInfoMap: serviceInfoMap ?? [],
  apiLayers: options?.apiLayers ?? [],

  lambdaMaxMemoryInMiB: options?.lambdaMaxMemoryInMiB || 1024,

  logServiceName: options?.logServiceName,

  disableLogs: !!options?.disableLogs,

  apiBuildPath
});
