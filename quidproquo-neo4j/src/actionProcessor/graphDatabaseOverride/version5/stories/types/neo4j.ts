/* eslint-disable @typescript-eslint/no-explicit-any */

// Shared base type for common properties in Neo4j entities
export interface Neo4jGraphEntity {
  elementId: string;
  properties: Record<string, any>;
}

// Neo4jNodeResult extends the base type
export interface Neo4jNodeResult extends Neo4jGraphEntity {
  labels: string[];
}

// Neo4jRelationshipResult extends the base type
export interface Neo4jRelationshipResult extends Neo4jGraphEntity {
  startNodeElementId: string;
  endNodeElementId: string;
  type: string;
}

// Supporting scalar results (e.g., counts, sums, averages)
export type Neo4jScalarResult = number | string | boolean | null;

// Combined result type for nodes, relationships, and scalars
export type AnyNeo4jResult =
  | Neo4jNodeResult
  | Neo4jRelationshipResult
  | Neo4jScalarResult;

// Neo4j Cypher response format with results and optional notifications
export interface Neo4jNotification {
  code: string;
  description: string;
  severity: 'WARNING' | 'ERROR';
  title: string;
  position: {
    offset: number;
    line: number;
    column: number;
  };
  category: string;
}

// Neo4j Cypher request format
export interface Neo4jCypherRequest {
  statement: string;
  parameters?: Record<string, any>;
}

export interface Neo4jCypherResponse {
  data: {
    fields: string[];
    values: AnyNeo4jResult[][];
  };
  notifications?: Neo4jNotification[];
  bookmarks?: string[];
}
