import { QPQAWSLambdaConfig } from './QPQAWSLambdaConfig';

export const resolveResourceName = (
  resourceName: string,
  qpqAwsLambdaConfig: QPQAWSLambdaConfig,
) => {
  return qpqAwsLambdaConfig.resourceNameMap[resourceName] || resourceName;
};
