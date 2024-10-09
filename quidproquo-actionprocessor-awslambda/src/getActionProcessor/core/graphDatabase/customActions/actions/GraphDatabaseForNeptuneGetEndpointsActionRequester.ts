import { createErrorEnumForAction } from 'quidproquo-core';
import { GraphDatabaseForNeptuneActionType } from './GraphDatabaseForNeptuneActionType';
import { GraphDatabaseForNeptuneGetEndpointsActionRequester } from './GraphDatabaseForNeptuneGetEndpointsActionTypes';

export const GraphDatabaseForNeptuneGetEndpointsErrorTypeEnum = createErrorEnumForAction(GraphDatabaseForNeptuneActionType.GetEndpoints, []);

export function* askGraphDatabaseForNeptuneGetEndpoints(graphDatabaseName: string): GraphDatabaseForNeptuneGetEndpointsActionRequester {
  return yield {
    type: GraphDatabaseForNeptuneActionType.GetEndpoints,
    payload: {
      graphDatabaseName,
    },
  };
}
