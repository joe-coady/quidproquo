---
sidebar_position: 18
---

# System Actions

Execute stories, run parallel operations, and batch process actions.

## Overview

System actions provide meta-operations for executing stories, running operations in parallel, and batching actions for efficiency. These actions enable composition of complex workflows and performance optimization.

## Available Actions

### askSystemExecuteStory

Execute another story as a sub-routine.

#### Signature

```typescript
function* askSystemExecuteStory<T>(
  story: () => Generator<any, T, any>
): SystemExecuteStoryActionRequester<T>
```

#### Parameters

- **story** (`() => Generator<any, T, any>`): Story generator function to execute

#### Returns

Returns the result of the executed story.

#### Example

```typescript
import { askSystemExecuteStory } from 'quidproquo-core';

function* childStory(value: number) {
  const doubled = value * 2;
  yield* askLogCreate(LogLevelEnum.INFO, 'Child story', { doubled });
  return doubled;
}

function* parentStory() {
  const result = yield* askSystemExecuteStory(() => childStory(5));
  return result; // Returns 10
}
```

### askSystemRunParallel

Run multiple operations in parallel.

#### Signature

```typescript
function* askSystemRunParallel<T>(
  operations: Array<() => Generator<any, T, any>>
): SystemRunParallelActionRequester<T[]>
```

#### Parameters

- **operations** (`Array<() => Generator>`): Array of generator functions to run in parallel

#### Returns

Returns array of results in the same order as operations.

#### Example

```typescript
import { askSystemRunParallel } from 'quidproquo-core';

function* fetchAllData() {
  const results = yield* askSystemRunParallel([
    function* () { return yield* fetchUsers(); },
    function* () { return yield* fetchOrders(); },
    function* () { return yield* fetchProducts(); }
  ]);
  
  const [users, orders, products] = results;
  return { users, orders, products };
}
```

### askSystemBatch

Batch multiple actions for efficient execution.

#### Signature

```typescript
function* askSystemBatch<T>(
  actions: Action[]
): SystemBatchActionRequester<T[]>
```

#### Example

```typescript
function* batchOperations() {
  const results = yield* askSystemBatch([
    { type: 'KeyValueStore::Get', payload: { store: 'users', key: '1' } },
    { type: 'KeyValueStore::Get', payload: { store: 'users', key: '2' } },
    { type: 'KeyValueStore::Get', payload: { store: 'users', key: '3' } }
  ]);
  
  return results;
}
```

## System Patterns

### Story Composition

```typescript
// Reusable story components
function* validateUser(userId: string) {
  const user = yield* askKeyValueStoreGet('users', userId);
  if (!user || !user.isActive) {
    yield* askThrowError(ErrorTypeEnum.Forbidden, 'Invalid user');
  }
  return user;
}

function* checkPermission(userId: string, resource: string) {
  const permissions = yield* askKeyValueStoreGet('permissions', userId);
  if (!permissions?.includes(resource)) {
    yield* askThrowError(ErrorTypeEnum.Forbidden, 'Access denied');
  }
  return true;
}

function* logActivity(userId: string, action: string) {
  yield* askKeyValueStoreUpsert('activity-log', {
    id: yield* askNewGuid(),
    userId,
    action,
    timestamp: yield* askDateNow()
  });
}

// Compose stories
function* performSecureAction(userId: string, resource: string, action: string) {
  // Execute validation stories
  const user = yield* askSystemExecuteStory(() => validateUser(userId));
  yield* askSystemExecuteStory(() => checkPermission(userId, resource));
  
  // Perform action
  const result = yield* executeAction(action);
  
  // Log activity
  yield* askSystemExecuteStory(() => logActivity(userId, action));
  
  return result;
}
```

### Parallel Data Fetching

```typescript
function* fetchUserDashboard(userId: string) {
  const startTime = yield* askDateNow();
  
  // Fetch all data in parallel
  const results = yield* askSystemRunParallel([
    function* () {
      return yield* askKeyValueStoreGet('users', userId);
    },
    function* () {
      return yield* askKeyValueStoreQuery('orders', {
        filterCondition: {
          key: 'userId',
          operation: '=',
          valueA: userId
        }
      });
    },
    function* () {
      return yield* askKeyValueStoreQuery('notifications', {
        filterCondition: {
          key: 'userId',
          operation: '=',
          valueA: userId
        },
        limit: 10
      });
    },
    function* () {
      return yield* askNetworkRequest('GET', `/api/recommendations/${userId}`);
    }
  ]);
  
  const [user, orders, notifications, recommendations] = results;
  
  const duration = Date.parse(yield* askDateNow()) - Date.parse(startTime);
  yield* askLogCreate(LogLevelEnum.INFO, 'Dashboard data fetched', {
    userId,
    durationMs: duration
  });
  
  return {
    user,
    orders: orders.items,
    notifications: notifications.items,
    recommendations
  };
}
```

### Map-Reduce Pattern

```typescript
function* mapReduce<T, M, R>(
  items: T[],
  mapper: (item: T) => Generator<any, M, any>,
  reducer: (acc: R, value: M) => R,
  initial: R
) {
  // Map in parallel
  const mapped = yield* askSystemRunParallel(
    items.map(item => () => mapper(item))
  );
  
  // Reduce results
  return mapped.reduce(reducer, initial);
}

// Usage
function* calculateTotalRevenue(orderIds: string[]) {
  return yield* mapReduce(
    orderIds,
    function* (orderId) {
      const order = yield* askKeyValueStoreGet('orders', orderId);
      return order.total;
    },
    (sum, total) => sum + total,
    0
  );
}
```

### Retry with Story Execution

```typescript
function* retryStory<T>(
  story: () => Generator<any, T, any>,
  maxAttempts: number = 3,
  delayMs: number = 1000
) {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return yield* askSystemExecuteStory(story);
    } catch (error) {
      lastError = error;
      
      yield* askLogCreate(LogLevelEnum.WARN, `Attempt ${attempt} failed`, {
        error: error.message,
        attempt
      });
      
      if (attempt < maxAttempts) {
        yield* askDelay(delayMs * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

// Usage
function* reliableOperation() {
  return yield* retryStory(
    () => fetchCriticalData(),
    5,
    2000
  );
}
```

### Batch Database Operations

```typescript
function* batchUpsert(storeName: string, items: any[]) {
  const batchSize = 25; // DynamoDB batch write limit
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Create batch actions
    const actions = batch.map(item => ({
      type: 'KeyValueStore::Upsert',
      payload: {
        storeName,
        item
      }
    }));
    
    const batchResults = yield* askSystemBatch(actions);
    results.push(...batchResults);
    
    // Rate limiting
    if (i + batchSize < items.length) {
      yield* askDelay(100);
    }
  }
  
  return results;
}
```

### Conditional Parallel Execution

```typescript
function* conditionalParallel(conditions: Array<{
  condition: boolean;
  operation: () => Generator<any, any, any>;
}>) {
  const operations = conditions
    .filter(c => c.condition)
    .map(c => c.operation);
  
  if (operations.length === 0) {
    return [];
  }
  
  return yield* askSystemRunParallel(operations);
}

// Usage
function* fetchOptionalData(options: {
  includeProfile?: boolean;
  includeOrders?: boolean;
  includeNotifications?: boolean;
}) {
  const results = yield* conditionalParallel([
    {
      condition: options.includeProfile || false,
      operation: () => fetchUserProfile()
    },
    {
      condition: options.includeOrders || false,
      operation: () => fetchUserOrders()
    },
    {
      condition: options.includeNotifications || false,
      operation: () => fetchUserNotifications()
    }
  ]);
  
  return results;
}
```

### Transaction-like Operations

```typescript
function* transaction<T>(
  operations: Array<() => Generator<any, any, any>>,
  rollbacks: Array<() => Generator<any, any, any>>
) {
  const completed = [];
  
  try {
    for (let i = 0; i < operations.length; i++) {
      const result = yield* askSystemExecuteStory(operations[i]);
      completed.push(i);
    }
    
    return completed;
  } catch (error) {
    // Rollback completed operations in reverse order
    for (const index of completed.reverse()) {
      try {
        yield* askSystemExecuteStory(rollbacks[index]);
      } catch (rollbackError) {
        yield* askLogCreate(LogLevelEnum.ERROR, 'Rollback failed', {
          index,
          error: rollbackError.message
        });
      }
    }
    
    throw error;
  }
}
```

### Performance Monitoring

```typescript
function* monitoredExecution<T>(
  story: () => Generator<any, T, any>,
  name: string
) {
  const startTime = yield* askDateNow();
  const startMemory = process.memoryUsage();
  
  try {
    const result = yield* askSystemExecuteStory(story);
    
    const endTime = yield* askDateNow();
    const endMemory = process.memoryUsage();
    
    yield* askEventBusSendMessage('performance-metrics', {
      type: 'STORY_EXECUTION',
      data: {
        name,
        durationMs: Date.parse(endTime) - Date.parse(startTime),
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
        success: true
      }
    });
    
    return result;
  } catch (error) {
    yield* askEventBusSendMessage('performance-metrics', {
      type: 'STORY_EXECUTION',
      data: {
        name,
        durationMs: Date.parse(yield* askDateNow()) - Date.parse(startTime),
        success: false,
        error: error.message
      }
    });
    
    throw error;
  }
}
```

## Testing

```typescript
describe('System Actions', () => {
  test('executes story', () => {
    function* childStory() {
      return 'result';
    }
    
    function* parentStory() {
      return yield* askSystemExecuteStory(childStory);
    }
    
    const story = parentStory();
    const { value: action } = story.next();
    
    expect(action.type).toBe('System::ExecuteStory');
    
    const { value: result } = story.next('result');
    expect(result).toBe('result');
  });
  
  test('runs parallel operations', () => {
    function* parallel() {
      return yield* askSystemRunParallel([
        function* () { return 1; },
        function* () { return 2; },
        function* () { return 3; }
      ]);
    }
    
    const story = parallel();
    const { value: action } = story.next();
    
    expect(action.type).toBe('System::RunParallel');
    expect(action.payload.operations).toHaveLength(3);
    
    const { value: results } = story.next([1, 2, 3]);
    expect(results).toEqual([1, 2, 3]);
  });
});
```

## Best Practices

### 1. Use Parallel for Independent Operations

```typescript
// Good - independent operations
yield* askSystemRunParallel([
  () => fetchUserData(),
  () => fetchProductData(),
  () => fetchOrderData()
]);

// Bad - dependent operations
yield* askSystemRunParallel([
  () => createUser(),
  () => addUserToGroup() // Depends on user creation
]);
```

### 2. Handle Partial Failures

```typescript
function* parallelWithErrorHandling(operations: Function[]) {
  const results = yield* askSystemRunParallel(
    operations.map(op => async function* () {
      try {
        return { success: true, data: yield* op() };
      } catch (error) {
        return { success: false, error: error.message };
      }
    })
  );
  
  return results;
}
```

### 3. Compose Stories for Reusability

```typescript
// Good - reusable stories
function* validateInput(data: any) { /* ... */ }
function* processData(data: any) { /* ... */ }
function* saveResults(results: any) { /* ... */ }

function* workflow(input: any) {
  const validated = yield* askSystemExecuteStory(() => validateInput(input));
  const processed = yield* askSystemExecuteStory(() => processData(validated));
  return yield* askSystemExecuteStory(() => saveResults(processed));
}
```

## Related Actions

- **Platform Actions** - For delays between operations
- **State Actions** - For operation state
- **Log Actions** - For execution logging
- **Error Actions** - For error handling