import {
  GraphDatabaseExecuteOpenCypherQueryActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  GraphDatabaseActionType,
  actionResultErrorFromCaughtError,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getConfigRuntimeResourceNameFromConfig } from '../../../awsNamingUtils';

import { getNeptuneEndpoints } from '../../../logic/neptune';

const getProcessExecuteOpenCypherQuery = (qpqConfig: QPQConfig): GraphDatabaseExecuteOpenCypherQueryActionProcessor => {
  return async ({ graphDatabaseName }, session, actionProcessorList, logger, updateSession, dynamicModuleLoader) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const databaseName = getConfigRuntimeResourceNameFromConfig(graphDatabaseName, qpqConfig);

    try {
      const endpoints = await getNeptuneEndpoints(databaseName, region);

      return actionResult(endpoints);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {});
    }
  };
};

export const getGraphDatabaseExecuteOpenCypherQueryActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.ExecuteOpenCypherQuery]: getProcessExecuteOpenCypherQuery(qpqConfig),
});
