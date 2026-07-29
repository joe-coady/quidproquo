import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  decomposeScopedKvsValue,
  KeyValueStoreActionType,
  KeyValueStoreScanAllScopesActionProcessor,
  KeyValueStoreScanAllScopesErrorTypeEnum,
  KvsScopedItem,
  QPQConfig,
  resolveKvsStoreConfigOrThrow,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { scan } from '../../../logic/dynamo';

// Every row in the table, scope and all. No scoped translator is involved: that is the whole
// point, and it is why this action is migration-only (see askKeyValueStoreScanAllScopes).
//
// The scope is composed into the partition key value, so each row is split back into the
// scope it belongs to plus its raw key, exactly as the stream processor does. The caller gets
// items indistinguishable from a scoped read, plus the scope beside them.
const getProcessKeyValueStoreScanAllScopes = (qpqConfig: QPQConfig): KeyValueStoreScanAllScopesActionProcessor<any> => {
  return async ({ keyValueStoreName, filterCondition, nextPageKey }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);
      const partitionKey = storeConfig.partitionKey.key;

      const page = await scan<any>(dynamoTableName, region, filterCondition, nextPageKey);

      const items: KvsScopedItem<any>[] = page.items.map((item: any) => {
        // Only a string partition key can carry a composed scope; anything else is unscoped
        // by construction.
        if (storeConfig.partitionKey.type !== 'string') {
          return { item };
        }

        const { scope, rawValue } = decomposeScopedKvsValue(String(item[partitionKey] ?? ''));

        return { scope, item: { ...item, [partitionKey]: rawValue } };
      });

      return actionResult({ items, nextPageKey: page.nextPageKey });
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreScanAllScopesErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreScanAllScopesErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreScanAllScopesErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreScanAllScopesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.ScanAllScopes]: getProcessKeyValueStoreScanAllScopes(qpqConfig),
});
