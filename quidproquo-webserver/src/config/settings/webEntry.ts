import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

import { ResponseSecurityHeaders } from '../types/ResponseSecurityHeaders';

export interface WebDomainOptions {
  subDomainName?: string;
  onRootDomain: boolean;
  rootDomain: string;
}

export interface StorageDriveOptions {
  sourceStorageDrive?: string;
  autoUpload: boolean;
}

export interface QPQConfigAdvancedWebEntrySettings extends QPQConfigAdvancedSettings {
  buildPath?: string;
  seoBuildPath?: string;

  storageDrive?: StorageDriveOptions;

  domain: WebDomainOptions;

  cacheSettingsName?: string;
  indexRoot?: string;
  ignoreCache?: string[];

  compressFiles?: boolean;

  cloudflareApiKeySecretName?: string;

  securityHeaders?: ResponseSecurityHeaders;
}

export interface WebEntryQPQWebServerConfigSetting extends QPQConfigSetting {
  name: string;
  indexRoot: string;

  storageDrive: StorageDriveOptions;
  domain: WebDomainOptions;

  buildPath?: string;
  seoBuildPath?: string;
  cacheSettingsName?: string;
  ignoreCache: string[];

  compressFiles: boolean;

  cloudflareApiKeySecretName?: string;

  securityHeaders?: ResponseSecurityHeaders;
}

export const defineWebEntry = (
  name: string,
  options: QPQConfigAdvancedWebEntrySettings,
): WebEntryQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.WebEntry,
  uniqueKey: name,

  name,
  indexRoot: options?.indexRoot || 'index.html',

  storageDrive: options?.storageDrive || {
    autoUpload: true,
  },

  domain: options.domain,

  buildPath: options?.buildPath,
  seoBuildPath: options?.seoBuildPath,
  ignoreCache: options?.ignoreCache || [],

  compressFiles: options?.compressFiles ?? true,

  securityHeaders: options?.securityHeaders,

  cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,

  cacheSettingsName: options?.cacheSettingsName,
});
