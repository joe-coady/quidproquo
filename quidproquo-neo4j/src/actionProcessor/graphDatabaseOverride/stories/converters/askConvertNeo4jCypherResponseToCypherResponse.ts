import { askMap, askReduce, AskResponse, GraphCypherResponse, GraphQueryResult } from 'quidproquo-core';

import { Neo4jCypherResponse } from '../types';
import { askConvertAnyNeo4jResultToAnyGraphResult } from './askConvertAnyNeo4jResultToAnyGraphResult';

export function* askConvertNeo4jCypherResponseToCypherResponse(neo4jCypherResponse: Neo4jCypherResponse): AskResponse<GraphCypherResponse> {
  const results = yield* askMap(neo4jCypherResponse.data.values, function* askConvertValuesToGraphQueryResult(values) {
    const graphQueryResult: GraphQueryResult = yield* askReduce(
      values,
      {} as GraphQueryResult,
      function* askCombineAnyNeo4jResultIntoGraphQueryResult(acc, value, index) {
        return {
          ...acc,

          [neo4jCypherResponse.data.fields[index]]: yield* askConvertAnyNeo4jResultToAnyGraphResult(value),
        };
      },
    );

    return graphQueryResult;
  });

  return {
    results,
  };
}
