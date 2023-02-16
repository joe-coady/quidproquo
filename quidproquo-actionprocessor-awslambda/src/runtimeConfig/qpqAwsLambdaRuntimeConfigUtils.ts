import { QPQConfig } from 'quidproquo-core';
import { getConfigRuntimeResourceNameFromConfig } from '../awsNamingUtils';

export const resolveResourceName = (resourceName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceNameFromConfig(resourceName, qpqConfig);
};

export const resolveSecretKey = (secretName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceNameFromConfig(secretName, qpqConfig);
};

export const resolveParameterKey = (parameterName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceNameFromConfig(parameterName, qpqConfig);
};
