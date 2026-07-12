import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResultError,
  actionResultErrorFromCaughtError,
  ErrorTypeEnum,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { actionResult, KeyValueStoreActionType, KeyValueStoreQueryActionProcessor, KeyValueStoreQueryErrorTypeEnum } from 'quidproquo-core';

import { getKvsDynamoTableNameFromConfig } from '../../../awsNamingUtils';
import { query } from '../../../logic/dynamo';
import { getDynamoTableIndexByConfigAndQuery } from '../../../logic/dynamo/qpqDynamoOrm';
import { getScopedKvsTranslatorOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreQuery = (qpqConfig: QPQConfig): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    const dynamoTableName = getKvsDynamoTableNameFromConfig(keyValueStoreName, qpqConfig, 'kvs');
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const storeConfig = qpqCoreUtils.getKeyValueStoreByName(qpqConfig, keyValueStoreName);
    if (!storeConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `Could not find key value store with name "${keyValueStoreName}"`);
    }

    try {
      // Scope lives inside the pk values, so pk conditions are rewritten to the
      // composed form (throws when the key condition never constrains the pk).
      const scoped = getScopedKvsTranslatorOrThrow(qpqConfig, keyValueStoreName, options?.scope);
      const effectiveKeyCondition = scoped.keyCondition(keyCondition);

      const items = await query<any>(
        dynamoTableName,
        region,
        effectiveKeyCondition,
        scoped.filter(options?.filter),
        options?.nextPageKey,
        getDynamoTableIndexByConfigAndQuery(storeConfig, effectiveKeyCondition),
        options?.limit,
        options?.sortAscending,
      );

      items.items = items.items.map((item: any) => scoped.strip(item));

      return actionResult(items);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InternalServerError: () => actionResultError(KeyValueStoreQueryErrorTypeEnum.ServiceUnavailable, 'KVS Service Unavailable'),
        ResourceNotFoundException: () => actionResultError(KeyValueStoreQueryErrorTypeEnum.ResourceNotFound, 'KVS Resource Not Found'),
        InvalidScopeError: (error) => actionResultError(KeyValueStoreQueryErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreQueryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig),
});
