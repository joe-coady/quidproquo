import { CrossModuleOwner, KeyOf } from '../../types';
import { QPQConfigAdvancedSettings, QPQConfigSetting, QPQCoreConfigSettingType } from '../QPQConfig';

// TODO: When we put validation on the QPQConfig, we need to make sure
// Key Length and Data Type: DynamoDB has limitations on key length and data type.
// Your KvsKeyType only supports 'string', 'number', and 'binary' types. Make sure
// that you're validating these in convertKvsKeyToDynamodbAttribute function and
// also ensure that key length is within DynamoDB's specified limits.

export type KvsKeyType = 'string' | 'number' | 'binary';
export type KvsKey<T extends object = any> = {
  key: KeyOf<T>;
  type: KvsKeyType;
};

export type KvsIndex<T extends object = any> = {
  partitionKey: KvsKey<T>;
  sortKey?: KvsKey<T>;
};

export const kvsKey = <T extends object = any>(key: KeyOf<T>, type: KvsKeyType = 'string'): KvsKey<T> => ({
  key,
  type,
});

type CompositeKvsKey<T extends object = any> = KvsKey<T> | KeyOf<T>;

type CompositeCompositeKvsIndex<T extends object = any> = {
  partitionKey: CompositeKvsKey<T>;
  sortKey?: CompositeKvsKey<T>;
};

export type CompositeKvsIndex<T extends object = any> = KeyOf<T> | CompositeCompositeKvsIndex<T>;

const convertCompositeKvsKeyToKvsKey = <T extends object = any>(compositeKvsKey: CompositeKvsKey<T>): KvsKey<T> => {
  // Must be a keyof T
  if (typeof compositeKvsKey === 'string') {
    return kvsKey<T>(compositeKvsKey as KeyOf<T>, 'string');
  }

  // must be a KvsKey<T>
  return compositeKvsKey as KvsKey<T>;
};

const isCompositeKvsIndexACompositeCompositeKvsIndex = <T extends object = any>(
  compositeKvsIndex: CompositeKvsIndex<T>,
): compositeKvsIndex is CompositeCompositeKvsIndex<T> => {
  return typeof compositeKvsIndex !== 'string';
};

const convertCompositeKvsIndexToKvsIndex = <T extends object = any>(compositeKvsIndex: CompositeKvsIndex<T>): KvsIndex<T> => {
  if (!isCompositeKvsIndexACompositeCompositeKvsIndex<T>(compositeKvsIndex)) {
    return {
      partitionKey: kvsKey<T>(compositeKvsIndex, 'string'),
    };
  }

  return {
    partitionKey: convertCompositeKvsKeyToKvsKey<T>(compositeKvsIndex.partitionKey),
    sortKey: compositeKvsIndex.sortKey ? convertCompositeKvsKeyToKvsKey<T>(compositeKvsIndex.sortKey) : undefined,
  };
};

export interface QPQConfigAdvancedKeyValueStoreSettings<T extends object = any> extends QPQConfigAdvancedSettings {
  indexes?: CompositeKvsIndex<T>[];

  global?: boolean;

  owner?: CrossModuleOwner;

  ttlAttribute?: string;

  enableMonthlyRollingBackups?: boolean;
}

export interface KeyValueStoreQPQConfigSetting<T extends object = any> extends QPQConfigSetting {
  keyValueStoreName: string;

  partitionKey: KvsKey<T>;
  sortKeys: KvsKey<T>[];

  indexes: KvsIndex<T>[];

  global: boolean;

  ttlAttribute?: string;

  enableMonthlyRollingBackups: boolean;
}

export const defineKeyValueStore = <T extends object = any>(
  keyValueStoreName: string,

  partitionKey: CompositeKvsKey<T>,
  sortKeys: CompositeKvsKey<T>[] = [],

  options?: QPQConfigAdvancedKeyValueStoreSettings<T>,
): KeyValueStoreQPQConfigSetting<T> => ({
  configSettingType: QPQCoreConfigSettingType.keyValueStore,
  uniqueKey: keyValueStoreName,

  keyValueStoreName,

  partitionKey: convertCompositeKvsKeyToKvsKey<T>(partitionKey),
  sortKeys: sortKeys.map(convertCompositeKvsKeyToKvsKey<T>),

  indexes: (options?.indexes ?? []).map(convertCompositeKvsIndexToKvsIndex<T>),

  global: options?.global ?? false,

  owner: options?.owner,

  ttlAttribute: options?.ttlAttribute,

  enableMonthlyRollingBackups: options?.enableMonthlyRollingBackups ?? false,
});
