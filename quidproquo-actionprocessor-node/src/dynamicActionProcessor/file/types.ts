// Required config with all fields filled by the dev server
export interface FileStorageConfig {
  storagePath: string;
  secureUrlPort: number;
  secureUrlHost: string;
  secureUrlSecret: string;
}