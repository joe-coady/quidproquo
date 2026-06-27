import { GraphDatabaseActionType, GraphDatabaseExecuteOpenCypherQueryAction, GraphDatabaseInstanceType, runStory } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { keepAlive } from './keepAlive';

describe('keepAlive', () => {
  it('runs a trivial read query against the scheduled database', () => {
    let queried: GraphDatabaseExecuteOpenCypherQueryAction['payload'] | undefined;

    runStory(keepAlive({ metadata: { databaseName: 'myDb' } } as any), {
      [GraphDatabaseActionType.ExecuteOpenCypherQuery]: (action: GraphDatabaseExecuteOpenCypherQueryAction) => {
        queried = action.payload;
        return { results: [] };
      },
    });

    expect(queried?.graphDatabaseName).toBe('myDb');
    expect(queried?.instance).toBe(GraphDatabaseInstanceType.Read);
    expect(queried?.openCypherQuery).toBe('RETURN 1 AS result');
  });
});
