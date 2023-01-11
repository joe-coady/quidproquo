import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';

export const lambdaRuntimeConfig = JSON.parse(
  process.env.lambdaRuntimeConfig || '{}',
) as QPQAWSLambdaConfig;
