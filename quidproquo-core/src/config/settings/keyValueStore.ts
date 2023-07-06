import { CrossModuleOwner } from '../../types';
import {
  QPQConfigSetting,
  QPQCoreConfigSettingType,
  QPQConfigAdvancedSettings,
} from '../QPQConfig';

// TODO: When we put validation on the QPQConfig, we need to make sure
// Key Length and Data Type: DynamoDB has limitations on key length and data type.
// Your KvsKeyType only supports 'string', 'number', and 'binary' types. Make sure
// that you're validating these in convertKvsKeyToDynamodbAttribute function and
// also ensure that key length is within DynamoDB's specified limits.

export type KvsKeyType = 'string' | 'number' | 'binary';
export type KvsKey = {
  key: string;
  type: KvsKeyType;
};

export type KvsIndex = {
  partitionKey: KvsKey;
  sortKey?: KvsKey;
};

export const kvsKey = (key: string, type: KvsKeyType = 'string'): KvsKey => ({
  key,
  type,
});

type CompositeKvsKey = KvsKey | string;
export type CompositeKvsIndex =
  | string
  | {
      partitionKey: CompositeKvsKey;
      sortKey?: CompositeKvsKey;
    };

const convertCompositeKvsKeyToKvsKey = (compositeKvsKey: CompositeKvsKey): KvsKey => {
  if (typeof compositeKvsKey === 'string') {
    return kvsKey(compositeKvsKey, 'string');
  }

  return compositeKvsKey;
};

const convertCompositeKvsIndexToKvsIndex = (compositeKvsIndex: CompositeKvsIndex): KvsIndex => {
  if (typeof compositeKvsIndex === 'string') {
    return {
      partitionKey: kvsKey(compositeKvsIndex, 'string'),
    };
  }

  return {
    partitionKey: convertCompositeKvsKeyToKvsKey(compositeKvsIndex.partitionKey),
    sortKey: compositeKvsIndex.sortKey
      ? convertCompositeKvsKeyToKvsKey(compositeKvsIndex.sortKey)
      : undefined,
  };
};

export interface QPQConfigAdvancedKeyValueStoreSettings extends QPQConfigAdvancedSettings {
  indexes?: CompositeKvsIndex[];

  global?: boolean;

  owner?: CrossModuleOwner;
}

export interface KeyValueStoreQPQConfigSetting extends QPQConfigSetting {
  keyValueStoreName: string;

  partitionKey: KvsKey;
  sortKeys: KvsKey[];

  indexes: KvsIndex[];

  global: boolean;
}

export const defineKeyValueStore = (
  keyValueStoreName: string,

  partitionKey: CompositeKvsKey,
  sortKeys: CompositeKvsKey[] = [],

  options?: QPQConfigAdvancedKeyValueStoreSettings,
): KeyValueStoreQPQConfigSetting => ({
  configSettingType: QPQCoreConfigSettingType.keyValueStore,
  uniqueKey: keyValueStoreName,

  keyValueStoreName,

  partitionKey: convertCompositeKvsKeyToKvsKey(partitionKey),
  sortKeys: sortKeys.map(convertCompositeKvsKeyToKvsKey),

  indexes: (options?.indexes ?? []).map(convertCompositeKvsIndexToKvsIndex),

  global: options?.global ?? false,

  owner: options?.owner,
});
