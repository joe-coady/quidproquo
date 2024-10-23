import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';

import { getConfigRuntimeResourceNameFromConfig, getConfigRuntimeResourceNameFromConfigWithServiceOverride } from '../awsNamingUtils';

export const resolveResourceName = (resourceName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceNameFromConfig(resourceName, qpqConfig);
};

export const resolveSecretKey = (secretName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceNameFromConfig(secretName, qpqConfig);
};

export const resolveParameterKey = (parameterName: string, qpqConfig: QPQConfig) => {
  const secretConfig = qpqCoreUtils.getParameterConfig(parameterName, qpqConfig);

  return getConfigRuntimeResourceNameFromConfigWithServiceOverride(
    secretConfig.owner?.resourceNameOverride || parameterName,
    qpqConfig,
    secretConfig.owner?.module,
  );
};
