import {
  ActionProcessorList,
  ActionProcessorListResolver,
  AskResponse,
  askThrowError,
  ErrorTypeEnum,
  getProcessCustomImplementation,
  GraphCypherResponse,
  GraphDatabaseActionType,
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
  GraphDatabaseExecuteOpenCypherQueryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { askServiceFunctionExecute } from 'quidproquo-webserver';

import { randomUUID } from 'crypto';

const getGraphDatabaseExecuteOpenCypherStory = (qpqConfig: QPQConfig) => {
  return function* askRunNeptuneOpenCypherQuery(
    graphDatabaseExecuteOpenCypherQueryActionPayload: GraphDatabaseExecuteOpenCypherQueryActionPayload,
  ): AskResponse<GraphCypherResponse> {
    const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

    const graphDatabaseConfig = qpqCoreUtils
      .getOwnedGraphDatabases(qpqConfig)
      .find((graphDatabaseConfig) => graphDatabaseConfig.name === graphDatabaseExecuteOpenCypherQueryActionPayload.graphDatabaseName);

    if (!graphDatabaseConfig) {
      return yield* askThrowError(
        ErrorTypeEnum.GenericError,
        `Invalid graph config for [${graphDatabaseExecuteOpenCypherQueryActionPayload.graphDatabaseName}]`,
      );
    }

    const functionName = `graphQuery${graphDatabaseConfig.virualNetworkName}`;

    return yield* askServiceFunctionExecute<GraphCypherResponse, GraphDatabaseExecuteOpenCypherQueryActionPayload>(
      serviceName,
      functionName,
      graphDatabaseExecuteOpenCypherQueryActionPayload,
    );
  };
};

export const getGraphDatabaseExecuteOpenCypherQueryActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [GraphDatabaseActionType.ExecuteOpenCypherQuery]: getProcessCustomImplementation<GraphDatabaseExecuteOpenCypherQueryActionProcessor>(
    qpqConfig,
    getGraphDatabaseExecuteOpenCypherStory(qpqConfig),
    'Neptune Cypher Query - dev server',
    null,
    () => new Date().toISOString(),
    randomUUID,
  ),
});
