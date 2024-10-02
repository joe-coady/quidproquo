import {
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  actionResultErrorFromCaughtError,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getConfigRuntimeResourceNameFromConfig } from '../../../../../awsNamingUtils';
import { GraphDatabaseForNeptuneActionType, GraphDatabaseForNeptuneGetEndpointsActionProcessor } from '../actions';

import { getNeptuneEndpoints } from '../../../../../logic/neptune';

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
