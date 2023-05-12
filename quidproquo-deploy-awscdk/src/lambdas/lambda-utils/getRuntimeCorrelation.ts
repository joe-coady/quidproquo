import { QPQConfig, qpqCoreUtils } from 'quidproquo-core';
import { awsLambdaUtils } from 'quidproquo-actionprocessor-awslambda';

export const getRuntimeCorrelation = (qpqConfig: QPQConfig): string => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return `${moduleName}-${awsLambdaUtils.randomGuid()}`;
};
