import { QPQConfig, QpqFunctionRuntime } from 'quidproquo-core';

export type DevServerConfig = {
  serverDomain: 'localhost';
  serverPort: number;
  webSocketPort?: number;

  dynamicModuleLoader: <T = any>(serviceName: string, modulePath: QpqFunctionRuntime) => Promise<T>;
  qpqConfigs: QPQConfig[];
};
