import { QPQConfig, QpqFunctionRuntime } from 'quidproquo-core';

export type DevServerConfig = {
  serverDomain: 'localhost';
  serverPort: 8080;

  dynamicModuleLoader: <T = any>(serviceName: string, modulePath: QpqFunctionRuntime) => Promise<T>;
  qpqConfigs: QPQConfig[];
};
