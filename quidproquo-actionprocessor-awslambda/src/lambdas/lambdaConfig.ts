import { ActionProcessorList } from 'quidproquo-core';

import { QPQAWSLambdaConfig } from '../runtimeConfig/QPQAWSLambdaConfig';

export const lambdaRuntimeConfig = JSON.parse(
  process.env.lambdaRuntimeConfig || '{}',
) as QPQAWSLambdaConfig;

export type ActionProcessorListResolver = (
  lambdaRuntimeConfig: QPQAWSLambdaConfig,
) => ActionProcessorList;
