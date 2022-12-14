import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';
import { QPQConfig } from 'quidproquo-core';

export const lambdaRuntimeConfig = JSON.parse(
  process.env.lambdaRuntimeConfig || '{}',
) as QPQAWSLambdaConfig;
