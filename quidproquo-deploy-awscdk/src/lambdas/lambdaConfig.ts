import { QPQConfig } from 'quidproquo-core';

// @ts-ignore
import qpqConfig from 'qpq-config-loader!';

export interface QPQCDKConfig {
  qpqConfig: QPQConfig;
}

export const getLambdaConfigs = async (): Promise<QPQCDKConfig> => {
  return {
    qpqConfig: qpqConfig,
  };
};
