import { QPQConfig } from 'quidproquo-core';
export interface LambdaRuntimeConfig {
  src: string;
  runtime: string;
}

export interface QPQAWSLambdaConfig {
  qpqConfig: QPQConfig;

  resourceNameMap: Record<string, string>;
  secretNameMap: Record<string, string>;

  lambdaRuntimeConfig?: LambdaRuntimeConfig;
}
