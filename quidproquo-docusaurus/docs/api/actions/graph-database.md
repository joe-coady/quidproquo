---
sidebar_position: 10
---

# Graph Database Actions

Execute graph database queries using OpenCypher syntax across different graph database platforms.

## Overview

Graph Database actions provide a platform-agnostic way to work with graph databases using the OpenCypher query language. Whether your backend uses AWS Neptune, Neo4j, or another graph database, these actions abstract the complexity while providing full query capabilities for nodes, relationships, and graph traversals.

## Core Concepts

### Graph Data Model

- **Nodes**: Entities with properties and labels
- **Relationships**: Connections between nodes with types and properties
- **Properties**: Key-value pairs on nodes and relationships
- **Labels**: Categories for nodes
- **Paths**: Sequences of nodes and relationships

### OpenCypher

OpenCypher is a declarative graph query language that allows for expressive and efficient querying of graph data.

## Available Actions

### askGraphDatabaseExecuteOpenCypherQuery

Execute an OpenCypher query against a graph database.

#### Signature

```typescript
function* askGraphDatabaseExecuteOpenCypherQuery(
  graphDatabaseName: string,
  instance: GraphDatabaseInstanceType,
  openCypherQuery: string,
  params?: Record<string, any>
): GraphDatabaseExecuteOpenCypherQueryActionRequester
```

#### Parameters

- **graphDatabaseName** (`string`): Name of the graph database
- **instance** (`GraphDatabaseInstanceType`): 'read' or 'write' instance
- **openCypherQuery** (`string`): The OpenCypher query to execute
- **params** (`Record<string, any>`, optional): Query parameters

#### Returns

Returns `GraphCypherResponse` with query results.

#### Example

```typescript
import { 
  askGraphDatabaseExecuteOpenCypherQuery,
  GraphDatabaseInstanceType 
} from 'quidproquo-core';

// Create a node
function* createUser(userData: UserInput) {
  const query = `
    CREATE (u:User {
      id: $id,
      name: $name,
      email: $email,
      createdAt: datetime()
    })
    RETURN u
  `;
  
  const result = yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    {
      id: yield* askGuidNew(),
      name: userData.name,
      email: userData.email
    }
  );
  
  return result.results[0].u;
}

// Query nodes
function* findUsersByName(name: string) {
  const query = `
    MATCH (u:User)
    WHERE u.name CONTAINS $name
    RETURN u
    ORDER BY u.name
    LIMIT 10
  `;
  
  const result = yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { name }
  );
  
  return result.results.map(r => r.u);
}
```

### askGraphDatabaseInternalFieldNames

Get internal field names for graph database operations.

#### Signature

```typescript
function* askGraphDatabaseInternalFieldNames(): GraphDatabaseInternalFieldNamesActionRequester
```

#### Example

```typescript
function* getGraphMetadata() {
  const fieldNames = yield* askGraphDatabaseInternalFieldNames();
  
  return {
    nodeIdField: fieldNames.nodeId,
    relationshipIdField: fieldNames.relationshipId,
    labelsField: fieldNames.labels,
    typeField: fieldNames.type
  };
}
```

## Graph Query Patterns

### Creating Nodes and Relationships

```typescript
// Create nodes with relationships
function* createFriendship(userId1: string, userId2: string) {
  const query = `
    MATCH (u1:User {id: $userId1})
    MATCH (u2:User {id: $userId2})
    CREATE (u1)-[f:FRIENDS_WITH {
      since: datetime(),
      status: 'active'
    }]->(u2)
    RETURN u1, f, u2
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { userId1, userId2 }
  );
}

// Create with MERGE (create if not exists)
function* ensureUserExists(email: string) {
  const query = `
    MERGE (u:User {email: $email})
    ON CREATE SET 
      u.id = $id,
      u.createdAt = datetime()
    ON MATCH SET
      u.lastSeen = datetime()
    RETURN u
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { 
      email,
      id: yield* askGuidNew()
    }
  );
}
```

### Graph Traversal

```typescript
// Find friends of friends
function* findFriendsOfFriends(userId: string) {
  const query = `
    MATCH (user:User {id: $userId})-[:FRIENDS_WITH]->(friend:User)
    MATCH (friend)-[:FRIENDS_WITH]->(fof:User)
    WHERE NOT (user)-[:FRIENDS_WITH]-(fof) AND user <> fof
    RETURN DISTINCT fof
    LIMIT 20
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { userId }
  );
}

// Find shortest path
function* findShortestPath(userId1: string, userId2: string) {
  const query = `
    MATCH path = shortestPath(
      (u1:User {id: $userId1})-[:FRIENDS_WITH*]-(u2:User {id: $userId2})
    )
    RETURN path, length(path) as distance
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { userId1, userId2 }
  );
}

// Graph algorithms
function* findInfluencers() {
  const query = `
    MATCH (u:User)-[r:FOLLOWS]->(influencer:User)
    WITH influencer, count(r) as followers
    WHERE followers > 1000
    RETURN influencer, followers
    ORDER BY followers DESC
    LIMIT 10
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query
  );
}
```

### Pattern Matching

```typescript
// Complex pattern matching
function* findRecommendations(userId: string) {
  const query = `
    MATCH (user:User {id: $userId})-[:LIKES]->(item:Product)<-[:LIKES]-(other:User)
    MATCH (other)-[:LIKES]->(rec:Product)
    WHERE NOT (user)-[:LIKES]-(rec)
    WITH rec, count(DISTINCT other) as score
    RETURN rec, score
    ORDER BY score DESC
    LIMIT 10
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'recommendation-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { userId }
  );
}

// Temporal patterns
function* findRecentActivity(userId: string, days: number) {
  const query = `
    MATCH (u:User {id: $userId})-[r:PERFORMED]->(a:Activity)
    WHERE r.timestamp > datetime() - duration({days: $days})
    RETURN a, r.timestamp as when
    ORDER BY r.timestamp DESC
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'activity-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { userId, days }
  );
}
```

### Aggregations and Analytics

```typescript
// Aggregation queries
function* getUserStatistics(userId: string) {
  const query = `
    MATCH (u:User {id: $userId})
    OPTIONAL MATCH (u)-[:FRIENDS_WITH]-(friend:User)
    OPTIONAL MATCH (u)-[:POSTED]->(post:Post)
    OPTIONAL MATCH (post)<-[:LIKED]-(liker:User)
    RETURN 
      u.name as name,
      count(DISTINCT friend) as friendCount,
      count(DISTINCT post) as postCount,
      count(DISTINCT liker) as totalLikes
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query,
    { userId }
  );
}

// Community detection
function* findCommunities() {
  const query = `
    MATCH (u1:User)-[:FRIENDS_WITH]-(u2:User)
    WITH u1, collect(u2) as friends
    WHERE size(friends) > 5
    UNWIND friends as friend
    MATCH (friend)-[:FRIENDS_WITH]-(fof:User)
    WHERE fof IN friends
    WITH u1, friends, count(fof) as interconnections
    WHERE interconnections > size(friends) * 2
    RETURN u1 as hub, friends as community, interconnections
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query
  );
}
```

### Updates and Deletions

```typescript
// Update properties
function* updateUserProfile(userId: string, updates: any) {
  const query = `
    MATCH (u:User {id: $userId})
    SET u += $updates
    SET u.updatedAt = datetime()
    RETURN u
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { userId, updates }
  );
}

// Delete relationships
function* removeFriendship(userId1: string, userId2: string) {
  const query = `
    MATCH (u1:User {id: $userId1})-[f:FRIENDS_WITH]-(u2:User {id: $userId2})
    DELETE f
    RETURN u1, u2
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { userId1, userId2 }
  );
}

// Cascade delete
function* deleteUserAndRelationships(userId: string) {
  const query = `
    MATCH (u:User {id: $userId})
    OPTIONAL MATCH (u)-[r]-()
    DELETE r, u
    RETURN count(r) as relationshipsDeleted
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { userId }
  );
}
```

## Advanced Patterns

### Transactions

```typescript
function* transferOwnership(itemId: string, fromUserId: string, toUserId: string) {
  // Multiple operations in single query for atomicity
  const query = `
    MATCH (item:Item {id: $itemId})
    MATCH (fromUser:User {id: $fromUserId})
    MATCH (toUser:User {id: $toUserId})
    MATCH (fromUser)-[owns:OWNS]->(item)
    DELETE owns
    CREATE (toUser)-[:OWNS {since: datetime()}]->(item)
    CREATE (fromUser)-[:PREVIOUSLY_OWNED {until: datetime()}]->(item)
    RETURN item, fromUser, toUser
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'ownership-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { itemId, fromUserId, toUserId }
  );
}
```

### Graph Projections

```typescript
function* createGraphProjection(name: string) {
  const query = `
    CALL gds.graph.project(
      $name,
      'User',
      {
        FRIENDS_WITH: {
          orientation: 'UNDIRECTED'
        }
      }
    )
    YIELD graphName, nodeCount, relationshipCount
    RETURN graphName, nodeCount, relationshipCount
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { name }
  );
}
```

### Batch Operations

```typescript
function* batchCreateUsers(users: UserInput[]) {
  const query = `
    UNWIND $users as userData
    CREATE (u:User {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: datetime()
    })
    RETURN collect(u) as createdUsers
  `;
  
  const usersWithIds = users.map(user => ({
    ...user,
    id: generateId() // Generate IDs before query
  }));
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    query,
    { users: usersWithIds }
  );
}
```

## Performance Optimization

### Indexes and Constraints

```typescript
function* createIndexes() {
  // Create index for faster lookups
  yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    'CREATE INDEX user_email IF NOT EXISTS FOR (u:User) ON (u.email)'
  );
  
  // Create uniqueness constraint
  yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Write,
    'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE'
  );
}
```

### Query Optimization

```typescript
// Use parameters for better query caching
function* optimizedQuery(filters: any) {
  const query = `
    MATCH (u:User)
    WHERE u.age > $minAge AND u.age < $maxAge
    WITH u
    LIMIT $limit
    MATCH (u)-[:POSTED]->(p:Post)
    WHERE p.createdAt > $since
    RETURN u, collect(p) as posts
  `;
  
  return yield* askGraphDatabaseExecuteOpenCypherQuery(
    'social-graph',
    GraphDatabaseInstanceType.Read,
    query,
    {
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      limit: 100,
      since: filters.since
    }
  );
}
```

## Testing

```typescript
describe('Graph Database Actions', () => {
  test('executes cypher query', () => {
    function* createNode() {
      return yield* askGraphDatabaseExecuteOpenCypherQuery(
        'test-graph',
        GraphDatabaseInstanceType.Write,
        'CREATE (n:Test {id: $id}) RETURN n',
        { id: '123' }
      );
    }
    
    const story = createNode();
    const { value: action } = story.next();
    
    expect(action.type).toBe('GraphDatabase::ExecuteOpenCypherQuery');
    expect(action.payload.graphDatabaseName).toBe('test-graph');
    expect(action.payload.params.id).toBe('123');
  });
});
```

## Best Practices

### 1. Use Parameters

```typescript
// Good - parameterized query
yield* askGraphDatabaseExecuteOpenCypherQuery(
  'graph',
  GraphDatabaseInstanceType.Read,
  'MATCH (u:User {id: $id}) RETURN u',
  { id: userId }
);

// Bad - string concatenation
yield* askGraphDatabaseExecuteOpenCypherQuery(
  'graph',
  GraphDatabaseInstanceType.Read,
  `MATCH (u:User {id: '${userId}'}) RETURN u` // SQL injection risk
);
```

### 2. Choose Correct Instance Type

```typescript
// Use Read instance for queries
const data = yield* askGraphDatabaseExecuteOpenCypherQuery(
  'graph',
  GraphDatabaseInstanceType.Read,
  'MATCH (n) RETURN n'
);

// Use Write instance for mutations
yield* askGraphDatabaseExecuteOpenCypherQuery(
  'graph',
  GraphDatabaseInstanceType.Write,
  'CREATE (n:Node) RETURN n'
);
```

### 3. Handle Large Result Sets

```typescript
function* paginatedQuery(pageSize: number = 100) {
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    const result = yield* askGraphDatabaseExecuteOpenCypherQuery(
      'graph',
      GraphDatabaseInstanceType.Read,
      `
        MATCH (n:Node)
        RETURN n
        ORDER BY n.id
        SKIP $skip
        LIMIT $limit
      `,
      { skip, limit: pageSize }
    );
    
    yield* processResults(result.results);
    
    hasMore = result.results.length === pageSize;
    skip += pageSize;
  }
}
```

## Related Actions

- **KeyValueStore Actions** - For document storage
- **File Actions** - For file attachments on nodes
- **EventBus Actions** - For graph change events
- **Log Actions** - For query logging