import { KvsCoreDataType, KvsUpdateAction, askKeyValueStoreUpdate, kvsRemove, kvsSet, kvsUpdate } from '../../actions';
import { AskResponse } from '../../types';
import { isValidKvsAdvancedDataType } from './utils';

export function askKeyValueStoreUpdatePartialProperties<TModel extends Record<string, any>, PartitionKey extends keyof TModel>(
  keyValueStoreName: string,
  partitionKeyName: PartitionKey,
  partialProperties: Partial<TModel> & {
    [key in PartitionKey]: TModel[PartitionKey];
  },
): AskResponse<TModel>;

export function askKeyValueStoreUpdatePartialProperties<
  TModel extends Record<string, any>,
  PartitionKey extends keyof TModel,
  SortKey extends keyof TModel,
>(
  keyValueStoreName: string,
  partitionKeyName: PartitionKey,
  partialProperties: Partial<TModel> & {
    [key in PartitionKey]: TModel[PartitionKey];
  } & { [key in SortKey]: TModel[SortKey] },
  sortKeyName: SortKey,
): AskResponse<TModel>;

export function* askKeyValueStoreUpdatePartialProperties<TModel extends Record<string, any>, PartitionKey extends keyof TModel>(
  keyValueStoreName: string,
  partitionKeyName: PartitionKey,
  partialProperties: Partial<TModel> & {
    [key in PartitionKey]: TModel[PartitionKey];
  },
  sortKeyName?: keyof TModel,
): AskResponse<TModel> {
  const operations = Object.entries(partialProperties).reduce<KvsUpdateAction[]>((acc, [key, value]) => {
    if (key !== partitionKeyName && key !== sortKeyName) {
      if (value === undefined) {
        acc.push(kvsRemove(key));
      } else if (isValidKvsAdvancedDataType(value)) {
        acc.push(kvsSet(key, value));
      }
    }
    return acc;
  }, []);

  return yield* askKeyValueStoreUpdate<TModel>(
    keyValueStoreName,
    kvsUpdate(operations),
    partialProperties[partitionKeyName],
    sortKeyName ? partialProperties[sortKeyName] : undefined,
  );
}
