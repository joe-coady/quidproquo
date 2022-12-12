export interface LambdaRuntimeConfig {
  src: string;
  runtime: string;
}

export interface QPQAWSLambdaConfig {
  resourceNameMap: Record<string, string>;
  lambdaRuntimeConfig?: LambdaRuntimeConfig;
}
