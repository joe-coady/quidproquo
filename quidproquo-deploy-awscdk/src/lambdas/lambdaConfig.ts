import { QPQConfig } from 'quidproquo-core';
import { getModuleQpqConfig } from 'quidproquo-actionprocessor-awslambda';

export interface QPQCDKConfig {
  qpqConfig: QPQConfig;
}

export const getLambdaConfigs = async (): Promise<QPQCDKConfig> => {
  console.log("Get Configs");

  const qpqConfig = await getModuleQpqConfig();

  console.log("Got Configs", qpqConfig);

  return {
    // This is injected in via the webpack plugin
    qpqConfig,
  };
};