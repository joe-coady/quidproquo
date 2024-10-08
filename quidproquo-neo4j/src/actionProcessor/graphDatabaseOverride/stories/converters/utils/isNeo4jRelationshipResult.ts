import { AnyNeo4jResult, Neo4jRelationshipResult } from '../../types';

export function isNeo4jRelationshipResult(
  anyNeo4jResult: AnyNeo4jResult
): anyNeo4jResult is Neo4jRelationshipResult {
  // Must be a scaler
  if (typeof anyNeo4jResult !== 'object') {
    return false;
  }

  // must be a relationship
  if ((anyNeo4jResult as Neo4jRelationshipResult).startNodeElementId) {
    return true;
  }

  return false;
}
