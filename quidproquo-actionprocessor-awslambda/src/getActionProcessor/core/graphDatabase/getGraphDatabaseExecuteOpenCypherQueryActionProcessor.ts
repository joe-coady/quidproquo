import {
  ActionProcessorList,
  ActionProcessorListResolver,
  getProcessCustomImplementation,
  GraphDatabaseActionType,
  GraphDatabaseExecuteOpenCypherQueryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { randomGuid } from '../../../awsLambdaUtils';
import { getGraphDatabaseForNeptuneActionProcessor } from './customActions';
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
