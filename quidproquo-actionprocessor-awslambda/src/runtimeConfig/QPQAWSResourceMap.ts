import { QPQConfig } from 'quidproquo-core';
export interface LambdaRuntimeConfig {
  src: string;
  runtime: string;
}

export interface QPQAWSResourceMap {
  resourceNameMap: Record<string, string>;
  secretNameMap: Record<string, string>;
  parameterNameMap: Record<string, string>;
}
