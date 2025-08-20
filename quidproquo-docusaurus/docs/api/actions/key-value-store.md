---
sidebar_position: 4
---

# Key-Value Store Actions

Manage structured data with a NoSQL key-value store that works across DynamoDB, Firestore, Cosmos DB, and local storage.

## Overview

Key-Value Store (KVS) actions provide a platform-agnostic interface for NoSQL database operations. Whether you're using AWS DynamoDB, Google Firestore, Azure Cosmos DB, or a local in-memory store, the same code works everywhere. KVS supports advanced querying, secondary indexes, atomic updates, and complex data types.

## Core Concepts

### Store Definition

Define key-value stores in your configuration:

```typescript
import { defineKeyValueStore } from 'quidproquo-core';

export default [
  // Simple store with single key
  defineKeyValueStore('users', {
    partitionKey: 'userId'
  }),
  
  // Store with composite key
  defineKeyValueStore('posts', {
    partitionKey: 'userId',
    sortKey: 'postId'
  }),
  
  // Store with secondary indexes
  defineKeyValueStore('orders', {
    partitionKey: 'orderId',
    indexes: [
      {
        name: 'byUser',
        partitionKey: 'userId',
        sortKey: 'createdAt'
      },
      {
        name: 'byStatus',
        partitionKey: 'status',
        sortKey: 'updatedAt'
      }
    ]
  })
];
```

### Data Types

KVS supports rich data types:

- **Basic Types**: string, number, boolean
- **List Types**: Arrays of basic types
- **Object Types**: Nested objects
- **Advanced Types**: Maps, sets, binary data

## Available Actions

### askKeyValueStoreGet

Retrieve a single item by key.

#### Signature

```typescript
function* askKeyValueStoreGet<T>(
  storeName: string,
  key: string | { partitionKey: string; sortKey?: string }
): Generator<KeyValueStoreGetAction, T | null, any>
```

#### Parameters

- **storeName** (`string`): Name of the key-value store
- **key** (`string | object`): Primary key or composite key object

#### Returns

Returns the item or `null` if not found.

#### Example

```typescript
// Simple key
function* getUser(userId: string) {
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  if (!user) {
    yield* askThrowError('NOT_FOUND', 'User not found');
  }
  return user;
}

// Composite key
function* getPost(userId: string, postId: string) {
  const post = yield* askKeyValueStoreGet<Post>('posts', {
    partitionKey: userId,
    sortKey: postId
  });
  return post;
}
```

### askKeyValueStoreUpsert

Insert or update an item.

#### Signature

```typescript
function* askKeyValueStoreUpsert<T>(
  storeName: string,
  item: T
): Generator<KeyValueStoreUpsertAction, void, any>
```

#### Parameters

- **storeName** (`string`): Name of the key-value store
- **item** (`T`): The item to insert or update (must include key fields)

#### Example

```typescript
function* createUser(email: string, name: string) {
  const userId = yield* askGuidNew();
  const user = {
    userId, // partition key
    email,
    name,
    createdAt: yield* askDateNow(),
    updatedAt: yield* askDateNow()
  };
  
  yield* askKeyValueStoreUpsert('users', user);
  return user;
}
```

### askKeyValueStoreUpdate

Update specific fields of an existing item.

#### Signature

```typescript
function* askKeyValueStoreUpdate<T>(
  storeName: string,
  key: string | { partitionKey: string; sortKey?: string },
  updates: KvsUpdate[]
): Generator<KeyValueStoreUpdateAction, T, any>
```

#### Parameters

- **storeName** (`string`): Name of the key-value store
- **key** (`string | object`): Primary key or composite key
- **updates** (`KvsUpdate[]`): Array of update operations

#### Update Operations

```typescript
type KvsUpdate = 
  | { type: 'SET'; path: string; value: any }
  | { type: 'REMOVE'; path: string }
  | { type: 'ADD'; path: string; value: number }
  | { type: 'APPEND'; path: string; value: any[] }
  | { type: 'PREPEND'; path: string; value: any[] }
  | { type: 'DELETE'; path: string; value: any[] };
```

#### Example

```typescript
function* updateUserProfile(userId: string, updates: Partial<User>) {
  const updateOps: KvsUpdate[] = [];
  
  if (updates.name) {
    updateOps.push({ type: 'SET', path: 'name', value: updates.name });
  }
  
  if (updates.email) {
    updateOps.push({ type: 'SET', path: 'email', value: updates.email });
  }
  
  // Increment login count
  updateOps.push({ type: 'ADD', path: 'loginCount', value: 1 });
  
  // Update timestamp
  updateOps.push({ type: 'SET', path: 'updatedAt', value: yield* askDateNow() });
  
  const updated = yield* askKeyValueStoreUpdate<User>('users', userId, updateOps);
  return updated;
}
```

### askKeyValueStoreDelete

Delete an item from the store.

#### Signature

```typescript
function* askKeyValueStoreDelete(
  storeName: string,
  key: string | { partitionKey: string; sortKey?: string }
): Generator<KeyValueStoreDeleteAction, void, any>
```

#### Example

```typescript
function* deleteUser(userId: string) {
  // Delete user data
  yield* askKeyValueStoreDelete('users', userId);
  
  // Delete related data
  const userPosts = yield* askKeyValueStoreQuery('posts', {
    index: 'byUser',
    keyCondition: { userId: { '=': userId } }
  });
  
  for (const post of userPosts.items) {
    yield* askKeyValueStoreDelete('posts', {
      partitionKey: userId,
      sortKey: post.postId
    });
  }
}
```

### askKeyValueStoreQuery

Query items using indexes and conditions.

#### Signature

```typescript
function* askKeyValueStoreQuery<T>(
  storeName: string,
  query: {
    index?: string;
    keyCondition: Record<string, any>;
    filterCondition?: KvsQueryOperation;
    limit?: number;
    pageToken?: string;
    scanIndexForward?: boolean;
  }
): Generator<KeyValueStoreQueryAction, { items: T[]; pageToken?: string }, any>
```

#### Parameters

- **storeName** (`string`): Name of the key-value store
- **query** (`object`): Query configuration
  - **index** (`string`, optional): Secondary index name
  - **keyCondition** (`object`): Key conditions for the query
  - **filterCondition** (`KvsQueryOperation`, optional): Additional filter
  - **limit** (`number`, optional): Maximum items to return
  - **pageToken** (`string`, optional): Pagination token
  - **scanIndexForward** (`boolean`, optional): Sort order (true = ascending)

#### Example

```typescript
function* getUserOrders(userId: string, status?: string) {
  const query: any = {
    index: 'byUser',
    keyCondition: {
      userId: { '=': userId }
    }
  };
  
  if (status) {
    query.filterCondition = {
      key: 'status',
      operation: '=',
      valueA: status
    };
  }
  
  const result = yield* askKeyValueStoreQuery<Order>('orders', query);
  return result.items;
}

// Complex query with multiple conditions
function* getRecentHighValueOrders() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const result = yield* askKeyValueStoreQuery<Order>('orders', {
    index: 'byStatus',
    keyCondition: {
      status: { '=': 'completed' }
    },
    filterCondition: {
      operation: 'AND',
      conditions: [
        {
          key: 'total',
          operation: '>',
          valueA: 1000
        },
        {
          key: 'createdAt',
          operation: '>',
          valueA: thirtyDaysAgo
        }
      ]
    },
    limit: 100
  });
  
  return result.items;
}
```

### askKeyValueStoreScan

Scan the entire table with optional filtering.

#### Signature

```typescript
function* askKeyValueStoreScan<T>(
  storeName: string,
  options?: {
    filterCondition?: KvsQueryOperation;
    limit?: number;
    pageToken?: string;
  }
): Generator<KeyValueStoreScanAction, { items: T[]; pageToken?: string }, any>
```

#### Example

```typescript
function* findInactiveUsers() {
  const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  
  const result = yield* askKeyValueStoreScan<User>('users', {
    filterCondition: {
      operation: 'AND',
      conditions: [
        {
          key: 'lastLoginAt',
          operation: '<',
          valueA: ninetyDaysAgo
        },
        {
          key: 'status',
          operation: '=',
          valueA: 'active'
        }
      ]
    }
  });
  
  return result.items;
}
```

### askKeyValueStoreGetAll

Get multiple items by their keys in a single operation.

#### Signature

```typescript
function* askKeyValueStoreGetAll<T>(
  storeName: string,
  keys: Array<string | { partitionKey: string; sortKey?: string }>
): Generator<KeyValueStoreGetAllAction, T[], any>
```

#### Example

```typescript
function* getUsersByIds(userIds: string[]) {
  const users = yield* askKeyValueStoreGetAll<User>('users', userIds);
  return users.filter(u => u !== null);
}
```

## Query Operations

### Query Operators

KVS supports various query operators:

- **Comparison**: `=`, `!=`, `<`, `<=`, `>`, `>=`
- **String**: `begins_with`, `contains`, `not_contains`
- **Existence**: `exists`, `not_exists`
- **Type**: `type_of`
- **Range**: `between`
- **Set**: `in`
- **Logical**: `AND`, `OR`, `NOT`

### Complex Query Examples

```typescript
// Find users with specific criteria
function* findUsers(criteria: any) {
  const conditions: any[] = [];
  
  if (criteria.ageMin) {
    conditions.push({
      key: 'age',
      operation: '>=',
      valueA: criteria.ageMin
    });
  }
  
  if (criteria.country) {
    conditions.push({
      key: 'address.country',
      operation: '=',
      valueA: criteria.country
    });
  }
  
  if (criteria.tags && criteria.tags.length > 0) {
    conditions.push({
      key: 'tags',
      operation: 'contains',
      valueA: criteria.tags[0]
    });
  }
  
  const result = yield* askKeyValueStoreScan<User>('users', {
    filterCondition: conditions.length > 1 
      ? { operation: 'AND', conditions }
      : conditions[0]
  });
  
  return result.items;
}
```

## Update Patterns

### Atomic Counters

```typescript
function* incrementPageViews(pageId: string) {
  yield* askKeyValueStoreUpdate('pages', pageId, [
    { type: 'ADD', path: 'views', value: 1 },
    { type: 'SET', path: 'lastViewedAt', value: yield* askDateNow() }
  ]);
}
```

### List Operations

```typescript
function* addToWishlist(userId: string, productId: string) {
  yield* askKeyValueStoreUpdate('users', userId, [
    { type: 'APPEND', path: 'wishlist', value: [productId] },
    { type: 'SET', path: 'wishlistUpdatedAt', value: yield* askDateNow() }
  ]);
}

function* removeFromWishlist(userId: string, productId: string) {
  yield* askKeyValueStoreUpdate('users', userId, [
    { type: 'DELETE', path: 'wishlist', value: [productId] }
  ]);
}
```

### Nested Object Updates

```typescript
function* updateAddress(userId: string, address: Address) {
  yield* askKeyValueStoreUpdate('users', userId, [
    { type: 'SET', path: 'address.street', value: address.street },
    { type: 'SET', path: 'address.city', value: address.city },
    { type: 'SET', path: 'address.zip', value: address.zip },
    { type: 'SET', path: 'addressVerified', value: false }
  ]);
}
```

## Pagination

```typescript
function* getAllOrders() {
  const allOrders: Order[] = [];
  let pageToken: string | undefined;
  
  do {
    const result = yield* askKeyValueStoreQuery<Order>('orders', {
      keyCondition: { status: { '=': 'active' } },
      limit: 100,
      pageToken
    });
    
    allOrders.push(...result.items);
    pageToken = result.pageToken;
  } while (pageToken);
  
  return allOrders;
}
```

## Transactions

```typescript
function* transferFunds(fromUserId: string, toUserId: string, amount: number) {
  // Get both accounts
  const [fromAccount, toAccount] = yield* askKeyValueStoreGetAll<Account>(
    'accounts',
    [fromUserId, toUserId]
  );
  
  if (!fromAccount || !toAccount) {
    yield* askThrowError('INVALID_ACCOUNTS', 'One or both accounts not found');
  }
  
  if (fromAccount.balance < amount) {
    yield* askThrowError('INSUFFICIENT_FUNDS', 'Not enough balance');
  }
  
  // Update both accounts
  yield* askBatch([
    askKeyValueStoreUpdate('accounts', fromUserId, [
      { type: 'ADD', path: 'balance', value: -amount }
    ]),
    askKeyValueStoreUpdate('accounts', toUserId, [
      { type: 'ADD', path: 'balance', value: amount }
    ])
  ]);
  
  // Log transaction
  yield* askKeyValueStoreUpsert('transactions', {
    transactionId: yield* askGuidNew(),
    fromUserId,
    toUserId,
    amount,
    timestamp: yield* askDateNow()
  });
}
```

## Best Practices

### 1. Design for Access Patterns

```typescript
// Design your keys and indexes based on how you'll query
defineKeyValueStore('posts', {
  partitionKey: 'postId',
  indexes: [
    { name: 'byAuthor', partitionKey: 'authorId', sortKey: 'createdAt' },
    { name: 'byTag', partitionKey: 'primaryTag', sortKey: 'popularity' },
    { name: 'byStatus', partitionKey: 'status', sortKey: 'updatedAt' }
  ]
});
```

### 2. Use Batch Operations

```typescript
function* batchCreateUsers(userData: UserInput[]) {
  const users = userData.map(data => ({
    userId: generateUserId(),
    ...data,
    createdAt: new Date().toISOString()
  }));
  
  // Batch insert
  yield* askBatch(
    users.map(user => askKeyValueStoreUpsert('users', user))
  );
  
  return users;
}
```

### 3. Implement Optimistic Locking

```typescript
function* updateWithOptimisticLock(itemId: string, updates: any) {
  const item = yield* askKeyValueStoreGet<any>('items', itemId);
  const currentVersion = item.version || 0;
  
  try {
    yield* askKeyValueStoreUpdate('items', itemId, [
      { type: 'SET', path: 'version', value: currentVersion + 1 },
      ...updates,
      {
        type: 'CONDITION',
        path: 'version',
        operation: '=',
        value: currentVersion
      }
    ]);
  } catch (error) {
    if (error.type === 'ConditionalCheckFailed') {
      yield* askThrowError('CONCURRENT_MODIFICATION', 'Item was modified by another process');
    }
    throw error;
  }
}
```

### 4. Cache Frequently Accessed Data

```typescript
function* getCachedUser(userId: string) {
  // Try cache first
  const cacheKey = `user-cache-${userId}`;
  const cached = yield* askKeyValueStoreGet<any>('cache', cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  
  // Get from main store
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  
  // Update cache
  if (user) {
    yield* askKeyValueStoreUpsert('cache', {
      key: cacheKey,
      data: user,
      expiresAt: Date.now() + 300000 // 5 minutes
    });
  }
  
  return user;
}
```

## Error Handling

```typescript
function* safeUpdate(storeName: string, key: string, updates: any) {
  const result = yield* askCatch(
    askKeyValueStoreUpdate(storeName, key, updates)
  );
  
  if (!result.success) {
    switch (result.error.errorType) {
      case 'ItemNotFound':
        yield* askLogCreate('WARN', `Item ${key} not found`);
        return null;
      
      case 'ConditionalCheckFailed':
        yield* askLogCreate('WARN', 'Conditional check failed');
        return null;
      
      case 'ValidationException':
        yield* askThrowError('INVALID_DATA', 'Data validation failed');
      
      default:
        throw result.error;
    }
  }
  
  return result.result;
}
```

## Testing

```typescript
test('user CRUD operations', async () => {
  const runtime = createTestRuntime({
    stores: {
      users: new Map()
    }
  });
  
  // Create
  const user = await runtime.execute(createUser, ['test@example.com', 'Test User']);
  expect(user.email).toBe('test@example.com');
  
  // Read
  const retrieved = await runtime.execute(getUser, [user.userId]);
  expect(retrieved.name).toBe('Test User');
  
  // Update
  await runtime.execute(updateUserProfile, [user.userId, { name: 'Updated Name' }]);
  
  // Delete
  await runtime.execute(deleteUser, [user.userId]);
  
  // Verify deletion
  const deleted = await runtime.execute(getUser, [user.userId]);
  expect(deleted).toBeNull();
});
```

## Related Actions

- **File Actions** - For unstructured data storage
- **Cache Actions** - For temporary data storage
- **Queue Actions** - For async processing
- **Event Actions** - For data change notifications