import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultErrorFromCaughtError,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { getConfigRuntimeResourceNameFromConfig } from '../../../../../awsNamingUtils';
import { getNeptuneEndpoints } from '../../../../../logic/neptune';
import { GraphDatabaseForNeptuneActionType, GraphDatabaseForNeptuneGetEndpointsActionProcessor } from '../actions';

const getProcessGetEndpoints = (qpqConfig: QPQConfig): GraphDatabaseForNeptuneGetEndpointsActionProcessor => {
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

export const getGraphDatabaseForNeptuneGetEndpointsActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseForNeptuneActionType.GetEndpoints]: getProcessGetEndpoints(qpqConfig),
});
