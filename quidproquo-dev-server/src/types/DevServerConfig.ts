import { FileStorageConfig } from 'quidproquo-actionprocessor-node';
import { QPQConfig, QpqFunctionRuntime } from 'quidproquo-core';

// Optional file storage config for input
export interface OptionalFileStorageConfig {
  storagePath?: string;
  secureUrlPort?: number;
  secureUrlHost?: string;
  secureUrlSecret?: string;
}

// Input config with optional file storage
export type DevServerConfig = {
  serverDomain: 'localhost';
  serverPort: number;
  webSocketPort?: number;
  
  // Base path for all dev server files, default: '.qpq-runtime'
  runtimePath?: string;

  dynamicModuleLoader: <T = any>(serviceName: string, modulePath: QpqFunctionRuntime) => Promise<T>;
  qpqConfigs: QPQConfig[];
  
  // File storage configuration (optional)
  fileStorageConfig?: OptionalFileStorageConfig;
};

// Resolved config with required file storage
export type ResolvedDevServerConfig = {
  serverDomain: 'localhost';
  serverPort: number;
  webSocketPort?: number;
  runtimePath: string;

  dynamicModuleLoader: <T = any>(serviceName: string, modulePath: QpqFunctionRuntime) => Promise<T>;
  qpqConfigs: QPQConfig[];
  
  // File storage configuration (required with all defaults filled)
  fileStorageConfig: FileStorageConfig;
};

export type DevServerConfigOverrides = {
  allServices?: QPQConfig;
  byService?: {
    [key: string]: QPQConfig;
  };
};
