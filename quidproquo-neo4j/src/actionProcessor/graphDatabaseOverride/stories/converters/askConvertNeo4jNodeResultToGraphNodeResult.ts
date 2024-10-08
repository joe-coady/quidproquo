import { AskResponse, GraphEntityType, GraphNodeResult } from 'quidproquo-core';

import { Neo4jNodeResult } from '../types';

export function* askConvertNeo4jNodeResultToGraphNodeResult(neptuneNodeResult: Neo4jNodeResult): AskResponse<GraphNodeResult> {
  return {
    $entityType: GraphEntityType.Node,
    $id: neptuneNodeResult.elementId,
    $labels: neptuneNodeResult.labels,
    $properties: neptuneNodeResult.properties,
  };
}
