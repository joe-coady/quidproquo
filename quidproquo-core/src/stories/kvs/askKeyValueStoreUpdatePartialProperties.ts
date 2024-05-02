import {
  KvsUpdateAction,
  askKeyValueStoreUpdate,
  kvsRemove,
  kvsSet,
  kvsUpdate,
} from '../../actions';
import { AskResponse } from '../../types';
import { isValidKvsAdvancedDataType } from './utils';

export function* askKeyValueStoreUpdatePartialProperties<
  TModel extends Record<string, any>,
  TKey extends keyof TModel,
>(
  keyValueStoreName: string,
  partitionKeyName: TKey,
  partialProperties: Partial<TModel> & {
    [key in TKey]: TModel[TKey];
  },
): AskResponse<TModel> {
  const operations = Object.entries(partialProperties).reduce<KvsUpdateAction[]>(
    (acc, [key, value]) => {
      if (key !== partitionKeyName) {
        if (value === undefined) {
          acc.push(kvsRemove(key));
        } else if (isValidKvsAdvancedDataType(value)) {
          acc.push(kvsSet(key, value));
        }
      }
      return acc;
    },
    [],
  );

  return yield* askKeyValueStoreUpdate<TModel>(
    keyValueStoreName,
    kvsUpdate(operations),
    partialProperties[partitionKeyName],
  );
}
