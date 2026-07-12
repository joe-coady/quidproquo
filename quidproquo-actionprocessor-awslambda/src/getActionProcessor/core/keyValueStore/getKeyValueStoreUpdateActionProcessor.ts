import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';
import {
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  getScopedKvsTranslatorOrThrow,
  KeyValueStoreActionType,
  KeyValueStoreUpdateActionProcessor,
  KeyValueStoreUpdateErrorTypeEnum,
  resolveKvsStoreConfigOrThrow,
} from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { updateItem } from '../../../logic/dynamo';

const getProcessKeyValueStoreUpdate = (qpqConfig: QPQConfig): KeyValueStoreUpdateActionProcessor<any> => {
  return async ({ keyValueStoreName, key, sortKey, updates, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      const storeConfig = resolveKvsStoreConfigOrThrow(qpqConfig, keyValueStoreName);
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);

      const item = await updateItem(
        dynamoTableName,
        region,
        updates,
        storeConfig.partitionKey.key,
        scoped.key(key),
        storeConfig.sortKeys[0]?.key,
        sortKey,
      );

      return actionResult(scoped.strip(item));
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreUpdateErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreUpdateErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreUpdateErrorTypeEnum.InvalidScope, error.message),
        KvsStoreNotFoundError: (error) => actionResultError(KeyValueStoreUpdateErrorTypeEnum.StoreNotFound, error.message),
      });
    }
  };
};

export const getKeyValueStoreUpdateActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Update]: getProcessKeyValueStoreUpdate(qpqConfig),
});
