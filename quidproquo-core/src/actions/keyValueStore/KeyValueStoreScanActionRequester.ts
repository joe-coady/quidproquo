import { createErrorEnumForAction } from '../../types';
import { KeyValueStoreActionType } from './KeyValueStoreActionType';
import { KeyValueStoreScanActionRequester } from './KeyValueStoreScanActionTypes';
import { KvsQueryOperation } from './types';

export const KeyValueStoreScanErrorTypeEnum = createErrorEnumForAction(KeyValueStoreActionType.Scan, [
  'ServiceUnavailable', // DynamoDB internal error / throttling
  'ResourceNotFound', // the underlying table does not exist
]);

export function* askKeyValueStoreScan<KvsItem>(
  keyValueStoreName: string,
  filterCondition?: KvsQueryOperation,
  nextPageKey?: string,
): KeyValueStoreScanActionRequester<KvsItem> {
  return yield {
    type: KeyValueStoreActionType.Scan,
    payload: {
      keyValueStoreName,

      filterCondition,

      nextPageKey,
    },
  };
}
