import { QpqSourceEntry } from './queue';
import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';
import { CrossModuleOwner } from '../../types';
import { convertCrossModuleOwnerToGenericResourceNameOverride } from '../../qpqCoreUtils';

/**
 * Represents different storage tiers for a "storageDrive".
 */
export enum StorageDriveTier {
  /**
   * Standard storage tier suitable for frequently accessed data.
   * (Reference: AWS S3 Standard)
   */
  REGULAR = 'REGULAR',

  /**
   * Storage tier optimized for data that is accessed less frequently,
   * but requires rapid access when needed. Lower availability compared
   * to the REGULAR tier.
   * (Reference: AWS S3 Infrequent Access)
   */
  OCCASIONAL_ACCESS = 'OCCASIONAL_ACCESS',

  /**
   * Optimized for infrequently accessed data stored in a single zone.
   * Lower availability compared to OCCASIONAL_ACCESS tier.
   * (Reference: AWS S3 One Zone-Infrequent Access)
   */
  SINGLE_ZONE_OCCASIONAL_ACCESS = 'SINGLE_ZONE_OCCASIONAL_ACCESS',

  /**
   * Cold storage tier suitable for long-term archival. Data retrieval
   * can take between minutes to hours. A cost-effective solution for
   * archival purposes where prompt data retrieval isn't crucial.
   * (Reference: AWS S3 Glacier)
   */
  COLD_STORAGE = 'COLD_STORAGE',

  /**
   * Cold storage tier optimized for long-term archival, but with the advantage
   * of immediate data access (in milliseconds). Ideal for data that might be
   * accessed once or twice per quarter.
   * (Reference: AWS S3 Glacier Instant Retrieval)
   */
  COLD_STORAGE_INSTANT_ACCESS = 'COLD_STORAGE_INSTANT_ACCESS',

  /**
   * Extremely cold storage suitable for data that's rarely accessed.
   * Data retrieval might take up to 12 hours. This offers the lowest
   * storage cost at the expense of retrieval time.
   * (Reference: AWS S3 Glacier Deep Archive)
   */
  DEEP_COLD_STORAGE = 'DEEP_COLD_STORAGE',

  /**
   * Dynamic storage tier designed to auto-optimize costs by moving data
   * between frequently and infrequently accessed tiers based on access patterns.
   * Ideal for long-lived data with unpredictable access patterns.
   * (Reference: AWS S3 Intelligent Tiering)
   */
  SMART_TIERING = 'SMART_TIERING',
}

export type StorageDriveTransition = { storageDriveTier: StorageDriveTier } & (
  | {
      transitionAfterDays: number;
      transitionDate?: never;
    }
  | {
      transitionAfterDays?: never;
      transitionDate: string;
    }
);

export type StorageDriveLifecycleRule = {
  prefix?: string;
  transitions?: StorageDriveTransition[];
  deleteAfterDays?: number;
  fileSizeLessThan?: number;
  fileSizeGreaterThan?: number;
  enabled?: boolean;

  // TODO: If we ever add versions
  // add noncurrentVersionExpiration / noncurrentVersionTransitions support
};

export interface StorageDriveEvents {
  buildPath: string;

  create?: QpqSourceEntry;
  delete?: QpqSourceEntry;
}

export interface QPQConfigAdvancedStorageDriveSettings extends QPQConfigAdvancedSettings {
  copyPath?: string;
  global?: boolean;

  onEvent?: StorageDriveEvents;

  lifecycleRules?: StorageDriveLifecycleRule[];

  owner?: CrossModuleOwner<'storageDriveName'>;
}

export interface StorageDriveQPQConfigSetting extends QPQConfigSetting {
  storageDrive: string;
  copyPath?: string;
  global: boolean;

  onEvent?: StorageDriveEvents;

  lifecycleRules?: StorageDriveLifecycleRule[];
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

  lifecycleRules: options?.lifecycleRules,

  owner: convertCrossModuleOwnerToGenericResourceNameOverride(options?.owner),
});
