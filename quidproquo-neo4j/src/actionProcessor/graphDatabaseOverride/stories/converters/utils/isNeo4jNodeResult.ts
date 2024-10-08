import {
  AnyNeo4jResult,
  Neo4jNodeResult,
  Neo4jRelationshipResult,
} from '../../types';

export function isNeo4jNodeResult(
  anyNeo4jResult: AnyNeo4jResult
): anyNeo4jResult is Neo4jNodeResult {
  // Must be a scaler
  if (typeof anyNeo4jResult !== 'object') {
    return false;
  }

  // must be a relationship
  if ((anyNeo4jResult as Neo4jRelationshipResult).startNodeElementId) {
    return false;
  }

  return true;
}
