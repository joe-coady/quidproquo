import { QPQConfig } from 'quidproquo-core';
import { getRuntimeResourceName } from '../awsLambdaUtils';

export const resolveResourceName = (resourceName: string, qpqConfig: QPQConfig) => {
  return getRuntimeResourceName(resourceName, qpqConfig);
};

export const resolveSecretKey = (secretName: string, qpqConfig: QPQConfig) => {
  return getRuntimeResourceName(secretName, qpqConfig);
};

export const resolveParameterKey = (parameterName: string, qpqConfig: QPQConfig) => {
  return getRuntimeResourceName(parameterName, qpqConfig);
};
