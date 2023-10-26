import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType, CacheSettings } from '../QPQConfig';

import { ResponseSecurityHeaders } from '../types/ResponseSecurityHeaders';

export interface WebDomainOptions {
  subDomainName?: string;
  onRootDomain: boolean;
}

export interface StorageDriveOptions {
  sourceStorageDrive?: string;
  autoUpload: boolean;
}

export interface CacheOptions extends CacheSettings {}

export interface QPQConfigAdvancedWebEntrySettings extends QPQConfigAdvancedSettings {
  buildPath?: string;
  seoBuildPath?: string;

  storageDrive?: StorageDriveOptions;
  cache?: CacheOptions;

  domain?: WebDomainOptions;

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
  cache: CacheOptions;

  buildPath?: string;
  seoBuildPath?: string;
  ignoreCache: string[];

  compressFiles: boolean;

  cloudflareApiKeySecretName?: string;

  securityHeaders?: ResponseSecurityHeaders;
}

export const defineWebEntry = (
  name: string,
  options?: QPQConfigAdvancedWebEntrySettings,
): WebEntryQPQWebServerConfigSetting => ({
  configSettingType: QPQWebServerConfigSettingType.WebEntry,
  uniqueKey: name,

  name,
  indexRoot: options?.indexRoot || 'index.html',

  storageDrive: options?.storageDrive || {
    autoUpload: true,
  },

  domain: options?.domain || {
    onRootDomain: true,
  },

  cache: options?.cache || {
    defaultTTLInSeconds: 7 * 24 * 60 * 60,
    minTTLInSeconds: 3 * 24 * 60 * 60,
    maxTTLInSeconds: 2 * 7 * 24 * 60 * 60,
    mustRevalidate: options?.cache?.mustRevalidate ?? false,
  },

  buildPath: options?.buildPath,
  seoBuildPath: options?.seoBuildPath,
  ignoreCache: options?.ignoreCache || [],

  compressFiles: options?.compressFiles ?? true,

  securityHeaders: options?.securityHeaders,

  cloudflareApiKeySecretName: options?.cloudflareApiKeySecretName,
});
