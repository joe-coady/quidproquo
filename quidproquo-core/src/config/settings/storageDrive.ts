import { QpqSourceEntry } from './queue';
import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

export enum StorageDriveEvent {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
}

export interface StorageDriveEvents {
  buildPath: string;
  
  create?: QpqSourceEntry;
  delete?: QpqSourceEntry;
}

export interface QPQConfigAdvancedStorageDriveSettings extends QPQConfigAdvancedSettings {
  copyPath?: string;
  global?: boolean;

  onEvent?: StorageDriveEvents;
}

export interface StorageDriveQPQConfigSetting extends QPQConfigSetting {
  storageDrive: string;
  copyPath?: string;
  global: boolean;

  onEvent?: StorageDriveEvents;
}

export const defineStorageDrive = (
  storageDrive: string,
  options?: QPQConfigAdvancedStorageDriveSettings,
): StorageDriveQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.storageDrive,
  uniqueKey: storageDrive,

  storageDrive,

  copyPath: options?.copyPath,

  global: options?.global ?? false,

  onEvent: options?.onEvent,
});
