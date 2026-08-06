import { createActionRequester } from 'quidproquo-core';

import { GraphDatabaseForNeptuneActionType } from './GraphDatabaseForNeptuneActionType';
import { GraphDatabaseEndpoints } from './GraphDatabaseForNeptuneGetEndpointsActionTypes';

export const askGraphDatabaseForNeptuneGetEndpoints = createActionRequester<GraphDatabaseEndpoints>()({
  actionType: GraphDatabaseForNeptuneActionType.GetEndpoints,
  getPayload: (graphDatabaseName: string) => ({ graphDatabaseName }),
});
