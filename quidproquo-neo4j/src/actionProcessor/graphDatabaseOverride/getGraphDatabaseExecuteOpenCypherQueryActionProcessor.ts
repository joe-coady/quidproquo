import { randomUUID } from 'crypto';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  getProcessCustomImplementation,
  GraphDatabaseActionType,
  GraphDatabaseExecuteOpenCypherQueryActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { askRunNeo4jOpenCypherQuery } from './stories';

export const getGraphDatabaseExecuteOpenCypherQueryActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.ExecuteOpenCypherQuery]: getProcessCustomImplementation<GraphDatabaseExecuteOpenCypherQueryActionProcessor>(
    qpqConfig,
    askRunNeo4jOpenCypherQuery,
    'Neo4j Cypher Query',
    null,
    () => new Date().toISOString(),
    randomUUID,
  ),
});
