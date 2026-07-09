---
sidebar_position: 11
---

# GUID Actions

Generate globally unique identifiers for your application entities.

## Overview

GUID (Globally Unique Identifier) actions provide platform-agnostic generation of unique identifiers. These actions ensure you get properly formatted, collision-resistant identifiers regardless of the runtime environment.

## Available Actions

### askNewGuid

Generate a new globally unique identifier.

#### Signature

```typescript
function* askNewGuid(): GuidNewActionRequester
```

#### Returns

Returns a string containing a new GUID/UUID.

#### Example

```typescript
import { askNewGuid } from 'quidproquo-core';

function* createEntity(data: any) {
  const id = yield* askNewGuid();
  
  return yield* askKeyValueStoreUpsert('entities', {
    id,
    ...data,
    createdAt: yield* askDateNow()
  });
}

function* generateUniqueKeys(count: number) {
  const keys = [];
  
  for (let i = 0; i < count; i++) {
    keys.push(yield* askNewGuid());
  }
  
  return keys;
}
```

### askNewSortableGuid

Generate a new sortable globally unique identifier.

#### Signature

```typescript
function* askNewSortableGuid(): GuidNewSortableActionRequester
```

#### Returns

Returns a string containing a new sortable GUID that includes timestamp information.

#### Example

```typescript
import { askNewSortableGuid } from 'quidproquo-core';

function* createTimeSeriesEntry(data: any) {
  // Sortable GUIDs include timestamp, making them ideal for time-series data
  const id = yield* askNewSortableGuid();
  
  return yield* askKeyValueStoreUpsert('timeseries', {
    id, // Will naturally sort by creation time
    ...data
  });
}

function* createOrderedEvents(events: any[]) {
  const orderedEvents = [];
  
  for (const event of events) {
    orderedEvents.push({
      id: yield* askNewSortableGuid(),
      ...event
    });
    
    // Small delay to ensure different timestamps
    yield* askPlatformDelay(1);
  }
  
  // Events can be sorted by ID to get chronological order
  return orderedEvents;
}
```

## Usage Patterns

### Entity Creation

```typescript
function* createUser(userData: UserInput) {
  const userId = yield* askNewGuid();
  
  const user = {
    id: userId,
    ...userData,
    apiKey: yield* askNewGuid(),
    sessionToken: yield* askNewGuid(),
    createdAt: yield* askDateNow()
  };
  
  yield* askKeyValueStoreUpsert('users', user);
  
  return user;
}
```

### Correlation IDs

```typescript
function* processRequestWithCorrelation(request: any) {
  const correlationId = yield* askNewGuid();
  
  yield* askContextProvide(correlationIdContext, correlationId);
  
  yield* askLogCreate('INFO', 'Request started', {
    correlationId,
    path: request.path
  });
  
  try {
    const result = yield* handleRequest(request);
    
    yield* askLogCreate('INFO', 'Request completed', {
      correlationId,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    yield* askLogCreate('ERROR', 'Request failed', {
      correlationId,
      error: error.message
    });
    
    throw error;
  }
}
```

### Batch Operations

```typescript
function* createBatchWithIds<T>(items: T[], storeName: string) {
  const itemsWithIds = [];
  
  for (const item of items) {
    itemsWithIds.push({
      id: yield* askNewGuid(),
      ...item
    });
  }
  
  // Batch insert with generated IDs
  for (const item of itemsWithIds) {
    yield* askKeyValueStoreUpsert(storeName, item);
  }
  
  return itemsWithIds;
}
```

### Unique File Names

```typescript
function* uploadFileWithUniqueNa (file: File) {
  const fileId = yield* askNewGuid();
  const extension = file.name.split('.').pop();
  const uniqueFileName = `${fileId}.${extension}`;
  
  yield* askFileWriteBinary(
    'uploads',
    uniqueFileName,
    file.content
  );
  
  return {
    fileId,
    originalName: file.name,
    storedName: uniqueFileName,
    uploadedAt: yield* askDateNow()
  };
}
```

### Time-Series Data

```typescript
function* createAuditLog(action: string, details: any) {
  // Use sortable GUID for chronological ordering
  const logId = yield* askNewSortableGuid();
  
  yield* askKeyValueStoreUpsert('audit-logs', {
    id: logId,
    action,
    details,
    userId: yield* askContextRead(userContext)?.id,
    timestamp: yield* askDateNow()
  });
  
  return logId;
}

function* getRecentAuditLogs(limit: number = 100) {
  // Sortable GUIDs allow efficient range queries
  const logs = yield* askKeyValueStoreQuery('audit-logs', {
    sortCondition: {
      key: 'id',
      direction: 'desc'
    },
    limit
  });
  
  return logs.items;
}
```

### Idempotency Keys

```typescript
function* processIdempotentOperation(operation: string, params: any) {
  const idempotencyKey = yield* askNewGuid();
  
  // Check if operation was already processed
  const existing = yield* askKeyValueStoreGet(
    'idempotency-keys',
    idempotencyKey
  );
  
  if (existing) {
    return existing.result;
  }
  
  // Process operation
  const result = yield* performOperation(operation, params);
  
  // Store result with idempotency key
  yield* askKeyValueStoreUpsert('idempotency-keys', {
    id: idempotencyKey,
    operation,
    params,
    result,
    processedAt: yield* askDateNow()
  });
  
  return result;
}
```

## Best Practices

### 1. Choose the Right GUID Type

```typescript
// Use regular GUID for entities
const userId = yield* askNewGuid();

// Use sortable GUID for time-series or logs
const eventId = yield* askNewSortableGuid();
```

### 2. Generate IDs Early

```typescript
// Good - generate ID before creation
function* createEntity(data: any) {
  const id = yield* askNewGuid();
  
  yield* askLogCreate('INFO', `Creating entity ${id}`);
  
  return yield* askKeyValueStoreUpsert('entities', {
    id,
    ...data
  });
}
```

### 3. Don't Rely on GUID Format

```typescript
// Good - treat as opaque string
const id = yield* askNewGuid();
yield* storeId(id);

// Bad - parsing GUID structure
const id = yield* askNewGuid();
const timestamp = id.substring(0, 8); // Don't do this
```

## Testing

```typescript
describe('GUID Actions', () => {
  test('generates unique identifiers', () => {
    function* generateIds() {
      const id1 = yield* askNewGuid();
      const id2 = yield* askNewGuid();
      return { id1, id2 };
    }
    
    const story = generateIds();
    
    // First GUID generation
    const { value: action1 } = story.next();
    expect(action1.type).toBe('Guid::New');
    
    const guid1 = 'mock-guid-1';
    
    // Second GUID generation
    story.next(guid1);
    const { value: action2 } = story.next();
    expect(action2.type).toBe('Guid::New');
    
    const guid2 = 'mock-guid-2';
    
    const { value: result } = story.next(guid2);
    expect(result.id1).toBe(guid1);
    expect(result.id2).toBe(guid2);
    expect(result.id1).not.toBe(result.id2);
  });
});
```

## Related Actions

- **KeyValueStore Actions** - Store entities with GUIDs
- **Context Actions** - Correlation IDs
- **Log Actions** - Trace IDs
- **File Actions** - Unique file names