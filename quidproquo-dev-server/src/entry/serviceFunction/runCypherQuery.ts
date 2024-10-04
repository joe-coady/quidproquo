import {
  AskResponse,
  ExecuteServiceFunctionEvent,
  GraphCypherResponse,
  GraphDatabaseExecuteOpenCypherQueryActionPayload,
  askGraphDatabaseExecuteOpenCypherQuery,
} from 'quidproquo';

export function* runCypherQuery(
  event: ExecuteServiceFunctionEvent<GraphDatabaseExecuteOpenCypherQueryActionPayload>,
): AskResponse<GraphCypherResponse> {
  const queryResponse = yield* askGraphDatabaseExecuteOpenCypherQuery(
    event.payload.graphDatabaseName,
    event.payload.instance,
    event.payload.openCypherQuery,
    event.payload.params,
  );

  return queryResponse;
}
