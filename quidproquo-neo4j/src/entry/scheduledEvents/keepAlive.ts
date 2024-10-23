import { askGraphDatabaseExecuteOpenCypherQuery,GraphDatabaseInstanceType, ScheduledEventParams } from 'quidproquo-core';

export function* keepAlive(event: ScheduledEventParams<{ databaseName: string }>) {
  yield* askGraphDatabaseExecuteOpenCypherQuery(event.metadata.databaseName, GraphDatabaseInstanceType.Read, `RETURN 1 AS result`);
}
