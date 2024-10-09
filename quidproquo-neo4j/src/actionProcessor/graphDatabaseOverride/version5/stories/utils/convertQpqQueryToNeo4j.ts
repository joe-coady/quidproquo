// Neo4j version: Replace qpqElementId(n) with elementId(n)
export function convertQpqQueryToNeo4j(query: string): string {
  return query.replace(/qpqElementId\((.*?)\)/g, 'elementId($1)');
}
