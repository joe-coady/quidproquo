import { qpqCoreUtils, QPQConfig } from 'quidproquo-core';

import { AwsServiceAccountInfoQPQConfigSetting, QPQAwsConfigSettingType } from '../config';

export const getAllAwsServiceAccountInfoConfigs = (
  qpqConfig: QPQConfig,
): AwsServiceAccountInfoQPQConfigSetting => {
  const serviceAccountInfos = qpqCoreUtils.getConfigSettings<AwsServiceAccountInfoQPQConfigSetting>(
    qpqConfig,
    QPQAwsConfigSettingType.serviceAccountInfo,
  );

  if (serviceAccountInfos.length === 0) {
    throw new Error('use defineAwsServiceAccountInfo to define aws deployment config');
  }

  if (serviceAccountInfos.length > 1) {
    throw new Error('max one entry of defineAwsServiceAccountInfo can be used');
  }

  return serviceAccountInfos[0];
};

// export const getAwsServiceAccountList = (qpqConfig: QPQConfig): string[] => {
//   const serviceAccountInfos = getAllAwsServiceAccountInfoConfigs(qpqConfig);
//   const serviceInfos = serviceAccountInfos.serviceInfoMap.flatMap((si) => si.serviceInfoMap);
// };
