import { QPQConfig } from 'quidproquo-core';
import { getConfigRuntimeResourceName } from '../awsNamingUtils';

export const resolveResourceName = (resourceName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceName(resourceName, qpqConfig);
};

export const resolveSecretKey = (secretName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceName(secretName, qpqConfig);
};

export const resolveParameterKey = (parameterName: string, qpqConfig: QPQConfig) => {
  return getConfigRuntimeResourceName(parameterName, qpqConfig);
};
