import { createErrorEnumForAction } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import {
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
  GraphDatabaseExecuteOpenCypherQueryActionRequester,
  GraphDatabaseInstanceType,
} from './GraphDatabaseExecuteOpenCypherQueryActionTypes';

export const GraphDatabaseExecuteOpenCypherQueryErrorTypeEnum = createErrorEnumForAction(GraphDatabaseActionType.ExecuteOpenCypherQuery, []);

export function* askGraphDatabaseExecuteOpenCypherQuery(
  graphDatabaseName: string,
  instance: GraphDatabaseInstanceType,
  openCypherQuery: GraphDatabaseExecuteOpenCypherQueryActionPayload['openCypherQuery'],
  params?: GraphDatabaseExecuteOpenCypherQueryActionPayload['params'],
): GraphDatabaseExecuteOpenCypherQueryActionRequester {
  return yield {
    type: GraphDatabaseActionType.ExecuteOpenCypherQuery,
    payload: {
      graphDatabaseName,

      openCypherQuery,
      params,

      instance,
    },
  };
}
