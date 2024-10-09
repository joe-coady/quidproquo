import { AskResponse, GraphEntityType, GraphRelationshipResult } from 'quidproquo-core';

import { Neo4jRelationshipResult } from '../types';

export function* askConvertNeo4jRelationshipResultToGraphRelationshipResult(
  neptuneRelationshipResult: Neo4jRelationshipResult,
): AskResponse<GraphRelationshipResult> {
  return {
    $entityType: GraphEntityType.Relationship,
    $id: neptuneRelationshipResult.elementId,
    $start: neptuneRelationshipResult.startNodeElementId,
    $end: neptuneRelationshipResult.endNodeElementId,
    $type: neptuneRelationshipResult.type,
    $properties: neptuneRelationshipResult.properties,
  };
}
