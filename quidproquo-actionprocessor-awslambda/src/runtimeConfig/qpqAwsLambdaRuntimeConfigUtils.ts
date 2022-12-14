import { QPQAWSLambdaConfig } from './QPQAWSLambdaConfig';

export const resolveResourceName = (
  resourceName: string,
  qpqAwsLambdaConfig: QPQAWSLambdaConfig,
) => {
  return qpqAwsLambdaConfig.resourceNameMap[resourceName] || resourceName;
};

export const resolveSecretKey = (secretName: string, qpqAwsLambdaConfig: QPQAWSLambdaConfig) => {
  return qpqAwsLambdaConfig.secretNameMap[secretName] || secretName;
};
