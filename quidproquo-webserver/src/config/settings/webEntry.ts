import { QPQConfigSetting, QPQConfigAdvancedSettings } from 'quidproquo-core';

import { QPQWebServerConfigSettingType } from '../QPQConfig';

export interface WebDomainOptions {
  subDomainName?: string;
  onRootDomain: boolean;
}

export interface StorageDriveOptions {
  sourceStorageDrive?: string;
  autoUpload: boolean;
}

export interface QPQConfigAdvancedWebEntrySettings extends QPQConfigAdvancedSettings {
  buildPath?: string;
  seoBuildPath?: string;

  storageDrive?: StorageDriveOptions;

  domain?: WebDomainOptions;

  indexRoot?: string;
}

export interface WebEntryQPQWebServerConfigSetting extends QPQConfigSetting {
  name: string;
  indexRoot: string;

  storageDrive: StorageDriveOptions;
  domain: WebDomainOptions;

  buildPath?: string;
  seoBuildPath?: string;
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

  buildPath: options?.buildPath,
  seoBuildPath: options?.seoBuildPath,
});
