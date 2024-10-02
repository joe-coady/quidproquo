import { createErrorEnumForAction } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { GraphDatabaseGetEndpointsActionRequester } from './GraphDatabaseGetEndpointsActionTypes';

export const GraphDatabaseGetEndpointsErrorTypeEnum = createErrorEnumForAction(GraphDatabaseActionType.GetEndpoints, []);

export function* askGraphDatabaseGetEndpoints(graphDatabaseName: string): GraphDatabaseGetEndpointsActionRequester {
  return yield {
    type: GraphDatabaseActionType.GetEndpoints,
    payload: {
      graphDatabaseName,
    },
  };
}
