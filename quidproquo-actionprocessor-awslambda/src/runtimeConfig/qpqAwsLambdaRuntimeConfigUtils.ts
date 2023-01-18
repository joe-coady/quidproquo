import { QPQAWSResourceMap } from './QPQAWSResourceMap';

export const resolveResourceName = (resourceName: string, awsResourceMap: QPQAWSResourceMap) => {
  return awsResourceMap.resourceNameMap[resourceName] || resourceName;
};

export const resolveSecretKey = (secretName: string, awsResourceMap: QPQAWSResourceMap) => {
  return awsResourceMap.secretNameMap[secretName] || secretName;
};

export const resolveParameterKey = (parameterName: string, awsResourceMap: QPQAWSResourceMap) => {
  return awsResourceMap.parameterNameMap[parameterName] || parameterName;
};
