// Shared base type for common properties
export interface NeptuneGraphEntity {
  '~id': string;
  '~properties': Record<string, any>;
}

// NeptuneNodeResult extends the base type
export interface NeptuneNodeResult extends NeptuneGraphEntity {
  '~entityType': 'node';
  '~labels': string[];
}

// NeptuneRelationshipResult extends the base type
export interface NeptuneRelationshipResult extends NeptuneGraphEntity {
  '~entityType': 'relationship';
  '~start': string;
  '~end': string;
  '~type': string;
}

// Supporting scalar results (e.g., counts, sums, averages)
export type NeptuneScalarResult = number | string | boolean | null;

// Combined result type for nodes, relationships, and scalars
export type AnyNeptuneResult = NeptuneNodeResult | NeptuneRelationshipResult | NeptuneScalarResult;

export interface NeptuneQueryResult {
  [key: string]: AnyNeptuneResult;
}

export interface NeptuneCypherRequest {
  query: string;
  parameters?: Record<string, any>;
}

export interface NeptuneCypherResponse {
  results: NeptuneQueryResult[];
}
