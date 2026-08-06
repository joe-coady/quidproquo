import { createActionRequester } from '../../types';
import { GraphDatabaseActionType } from './GraphDatabaseActionType';
import { GraphCypherResponse } from '../../config';
import { GraphDatabaseExecuteOpenCypherQueryActionPayload, GraphDatabaseInstanceType } from './GraphDatabaseExecuteOpenCypherQueryActionTypes';

export const askGraphDatabaseExecuteOpenCypherQuery = createActionRequester<GraphCypherResponse>()({
  actionType: GraphDatabaseActionType.ExecuteOpenCypherQuery,
  getPayload: (
    graphDatabaseName: string,
    instance: GraphDatabaseInstanceType,
    openCypherQuery: GraphDatabaseExecuteOpenCypherQueryActionPayload['openCypherQuery'],
    params?: GraphDatabaseExecuteOpenCypherQueryActionPayload['params'],
  ) => ({ graphDatabaseName, openCypherQuery, params, instance }),
});
