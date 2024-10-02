import {
  GraphDatabaseGetEndpointsActionProcessor,
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

const getProcessGetEndpoints = (qpqConfig: QPQConfig): GraphDatabaseGetEndpointsActionProcessor => {
  return async ({ graphDatabaseName }) => {
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

export const getGraphDatabaseGetEndpointsActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.GetEndpoints]: getProcessGetEndpoints(qpqConfig),
});
