import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  KeyValueStoreActionType,
  KeyValueStoreQueryActionProcessor,
  KeyValueStoreQueryErrorTypeEnum,
  QPQConfig,
  validateScopedQueryConstrainsPkOrThrow,
} from 'quidproquo-core';

import { getKvsRepository } from '../../../logic/keyValueStore/getKvsRepository';
import { ResolvedDevServerConfig } from '../../../types';
import { resolveScopedPkAttributeOrThrow } from './kvsScopeUtils';

const getProcessKeyValueStoreQuery = (qpqConfig: QPQConfig, devServerConfig: ResolvedDevServerConfig): KeyValueStoreQueryActionProcessor<any> => {
  return async ({ keyValueStoreName, keyCondition, options }) => {
    try {
      const scope = options?.scope;
      const repository = getKvsRepository(qpqConfig, devServerConfig);

      // The json backend partitions per-scope at the FILE level, so the query
      // conditions run unmodified against the scope's own file. The validation
      // is pure dynamo parity: a scoped query that only works locally must
      // fail here too, not in production.
      if (scope !== undefined) {
        const pkAttribute = resolveScopedPkAttributeOrThrow(qpqConfig, keyValueStoreName, scope);
        validateScopedQueryConstrainsPkOrThrow(scope, keyCondition, ['pk', pkAttribute]);
      }

      const result = await repository.query(
        keyValueStoreName,
        keyCondition,
        options?.filter,
        options?.nextPageKey,
        undefined, // indexName - for basic implementation
        options?.limit,
        options?.sortAscending ?? true,
        scope,
      );

      return actionResult(result);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        return actionResultError('ResourceNotFound', error.message);
      }
      return actionResultErrorFromCaughtError(error, {
        InvalidScopeError: (error) => actionResultError(KeyValueStoreQueryErrorTypeEnum.InvalidScope, error.message),
      });
    }
  };
};

export const getKeyValueStoreQueryActionProcessor =
  (devServerConfig: ResolvedDevServerConfig): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig, _dynamicModuleLoader: any): Promise<ActionProcessorList> => ({
    [KeyValueStoreActionType.Query]: getProcessKeyValueStoreQuery(qpqConfig, devServerConfig),
  });
