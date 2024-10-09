import {
  askConfigGetGlobal,
  askConfigGetParameter,
  askConfigGetSecret,
  askNetworkRequest,
  AskResponse,
  askThrowError,
  ErrorTypeEnum,
  GraphCypherResponse,
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
} from 'quidproquo-core';

import { askConvertNeo4jCypherResponseToCypherResponse } from './converters';
import { Neo4jCypherRequest, Neo4jCypherResponse } from './types';
import { convertQpqQueryToNeo4j } from './utils';

export function* askRunNeo4jOpenCypherQuery({
  graphDatabaseName,
  openCypherQuery,
  params,
}: GraphDatabaseExecuteOpenCypherQueryActionPayload): AskResponse<GraphCypherResponse> {
  // Convert qpq functions to neo4j
  const neo4jQuery = convertQpqQueryToNeo4j(openCypherQuery);

  // Get the neo4j instance name
  const instanceName = yield* askConfigGetParameter(`neo4j-${graphDatabaseName}-instance`);

  // Get password
  const password = yield* askConfigGetSecret(`neo4j-${graphDatabaseName}-password`);

  const response = yield* askNetworkRequest<Neo4jCypherRequest, Neo4jCypherResponse>(
    'POST',
    `HTTPS://${instanceName}.databases.neo4j.io:443/db/neo4j/query/v2`,
    {
      body: {
        statement: neo4jQuery,
        parameters: params,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`neo4j:${password}`).toString('base64')}`,
      },
    },
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, 'Unable to query database');
  }

  return yield* askConvertNeo4jCypherResponseToCypherResponse(response.data);
}
