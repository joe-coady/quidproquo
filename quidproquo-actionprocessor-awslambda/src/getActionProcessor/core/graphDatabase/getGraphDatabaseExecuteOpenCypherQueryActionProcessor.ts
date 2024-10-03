import {
  GraphDatabaseExecuteOpenCypherQueryActionProcessor,
  QPQConfig,
  GraphDatabaseActionType,
  ActionProcessorListResolver,
  ActionProcessorList,
  getProcessCustomImplementation,
} from 'quidproquo-core';
import { getGraphDatabaseForNeptuneActionProcessor } from './customActions';
import { randomGuid } from '../../../awsLambdaUtils';
import { askRunNeptuneOpenCypherQuery } from './stories';

export const getGraphDatabaseExecuteOpenCypherQueryActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.ExecuteOpenCypherQuery]: getProcessCustomImplementation<GraphDatabaseExecuteOpenCypherQueryActionProcessor>(
    qpqConfig,
    askRunNeptuneOpenCypherQuery,
    'Neptune Cypher Query',
    getGraphDatabaseForNeptuneActionProcessor,
    () => new Date().toISOString(),
    randomGuid,
  ),
});
