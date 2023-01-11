import { ActionProcessorList } from 'quidproquo-core';
import { QPQAWSLambdaConfig } from 'quidproquo-actionprocessor-awslambda';

export type ActionProcessorListResolver = (
  lambdaRuntimeConfig: QPQAWSLambdaConfig,
) => ActionProcessorList;
