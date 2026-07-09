---
sidebar_position: 12
---

# Log Actions

Create structured logs with automatic context capture and platform-specific output.

## Overview

Log actions provide consistent logging across all platforms, automatically capturing execution context, correlation IDs, and structured data. Logs are routed to the appropriate platform-specific logging service (CloudWatch, Console, etc.) while maintaining a consistent format.

## Available Actions

### askLogCreate

Create a log entry with a specific level, message, and optional data.

#### Signature

```typescript
function* askLogCreate(
  logLevel: LogLevelEnum,
  msg: string,
  data?: any
): LogCreateActionRequester
```

#### Parameters

- **logLevel** (`LogLevelEnum`): Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- **msg** (`string`): Log message
- **data** (`any`, optional): Structured data to include

#### Example

```typescript
import { askLogCreate, LogLevelEnum } from 'quidproquo-core';

function* processOrder(order: Order) {
  yield* askLogCreate(LogLevelEnum.INFO, 'Processing order', {
    orderId: order.id,
    customerId: order.customerId,
    total: order.total
  });
  
  try {
    const result = yield* validateOrder(order);
    
    yield* askLogCreate(LogLevelEnum.DEBUG, 'Order validated', {
      orderId: order.id,
      validationResult: result
    });
    
    return result;
  } catch (error) {
    yield* askLogCreate(LogLevelEnum.ERROR, 'Order processing failed', {
      orderId: order.id,
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
}
```

### askLogTemplateLiteral

Create a log entry using template literals for dynamic messages.

#### Signature

```typescript
function* askLogTemplateLiteral(
  logLevel: LogLevelEnum,
  strings: TemplateStringsArray,
  ...values: any[]
): LogTemplateLiteralActionRequester
```

#### Example

```typescript
function* logWithTemplate(userId: string, action: string) {
  const count = 42;
  
  yield* askLogTemplateLiteral(
    LogLevelEnum.INFO,
    `User ${userId} performed ${action} on ${count} items`
  );
}
```

### askLogDisableEventHistory

Disable event history logging for sensitive operations.

#### Signature

```typescript
function* askLogDisableEventHistory(): LogDisableEventHistoryActionRequester
```

#### Example

```typescript
function* processSensitiveData(data: any) {
  // Disable logging of event history
  yield* askLogDisableEventHistory();
  
  // Process sensitive data without detailed logging
  const result = yield* encryptData(data);
  
  // Log only non-sensitive information
  yield* askLogCreate(LogLevelEnum.INFO, 'Sensitive operation completed', {
    operationType: 'encryption',
    recordCount: 1
  });
  
  return result;
}
```

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `DEBUG` | Detailed debugging information | Variable values, execution flow |
| `INFO` | General informational messages | Request received, operation completed |
| `WARN` | Warning messages for potential issues | Deprecated API usage, high memory |
| `ERROR` | Error messages for failures | Failed validation, network error |
| `FATAL` | Critical failures requiring immediate attention | Database connection lost |

## Logging Patterns

### Structured Logging

```typescript
function* structuredLogging(request: Request) {
  const context = {
    requestId: yield* askNewGuid(),
    userId: request.userId,
    path: request.path,
    method: request.method
  };
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Request received', context);
  
  const startTime = yield* askDateNow();
  
  try {
    const result = yield* processRequest(request);
    
    const duration = Date.parse(yield* askDateNow()) - Date.parse(startTime);
    
    yield* askLogCreate(LogLevelEnum.INFO, 'Request completed', {
      ...context,
      duration,
      statusCode: result.statusCode
    });
    
    return result;
  } catch (error) {
    yield* askLogCreate(LogLevelEnum.ERROR, 'Request failed', {
      ...context,
      error: {
        type: error.errorType,
        message: error.errorText,
        stack: error.errorStack
      }
    });
    
    throw error;
  }
}
```

### Performance Logging

```typescript
function* logPerformance<T>(
  operation: () => Generator<any, T, any>,
  operationName: string
) {
  const startTime = yield* askDateNow();
  const startMemory = yield* askSystemGetMemoryUsage();
  
  yield* askLogCreate(LogLevelEnum.DEBUG, `Starting ${operationName}`, {
    startTime,
    memoryMB: startMemory
  });
  
  try {
    const result = yield* operation();
    
    const endTime = yield* askDateNow();
    const endMemory = yield* askSystemGetMemoryUsage();
    const duration = Date.parse(endTime) - Date.parse(startTime);
    
    yield* askLogCreate(LogLevelEnum.INFO, `Completed ${operationName}`, {
      duration,
      memoryDelta: endMemory - startMemory,
      success: true
    });
    
    return result;
  } catch (error) {
    yield* askLogCreate(LogLevelEnum.ERROR, `Failed ${operationName}`, {
      duration: Date.parse(yield* askDateNow()) - Date.parse(startTime),
      error: error.message
    });
    
    throw error;
  }
}
```

### Audit Logging

```typescript
function* auditLog(action: string, entity: string, entityId: string, changes?: any) {
  const user = yield* askContextRead(userContext);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Audit event', {
    action,
    entity,
    entityId,
    userId: user?.id,
    userEmail: user?.email,
    timestamp: yield* askDateNow(),
    changes
  });
}

function* updateUserWithAudit(userId: string, updates: any) {
  const before = yield* askKeyValueStoreGet('users', userId);
  
  const after = yield* askKeyValueStoreUpdate('users', userId, updates);
  
  yield* auditLog('UPDATE', 'User', userId, {
    before: before,
    after: after,
    fields: Object.keys(updates)
  });
  
  return after;
}
```

### Error Context

```typescript
function* logErrorWithContext(error: any, operation: string) {
  const errorContext = {
    operation,
    errorType: error.errorType || error.name,
    errorMessage: error.errorText || error.message,
    errorStack: error.errorStack || error.stack,
    timestamp: yield* askDateNow(),
    correlationId: yield* askContextRead(correlationIdContext),
    userId: yield* askContextRead(userContext)?.id,
    environment: yield* askConfigGetParameter('environment')
  };
  
  yield* askLogCreate(LogLevelEnum.ERROR, `Error in ${operation}`, errorContext);
  
  // Send to error tracking service
  yield* askEventBusSendMessage('error-events', {
    type: 'APPLICATION_ERROR',
    data: errorContext
  });
}
```

### Debug Tracing

```typescript
function* debugTrace(functionName: string, inputs: any, outputs?: any) {
  if ((yield* askConfigGetParameter('debugMode')) !== 'true') {
    return;
  }
  
  yield* askLogCreate(LogLevelEnum.DEBUG, `[TRACE] ${functionName}`, {
    inputs,
    outputs,
    caller: new Error().stack?.split('\n')[2]
  });
}

function* calculatePrice(items: Item[]) {
  yield* debugTrace('calculatePrice', { itemCount: items.length });
  
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  yield* debugTrace('calculatePrice:subtotal', { subtotal });
  
  const tax = subtotal * 0.1;
  yield* debugTrace('calculatePrice:tax', { tax });
  
  const total = subtotal + tax;
  yield* debugTrace('calculatePrice:result', { subtotal, tax, total });
  
  return total;
}
```

### Log Aggregation

```typescript
function* batchLog(logs: LogEntry[]) {
  // Group logs by level
  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.level]) acc[log.level] = [];
    acc[log.level].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);
  
  // Log summary
  yield* askLogCreate(LogLevelEnum.INFO, 'Batch log summary', {
    total: logs.length,
    byLevel: Object.entries(grouped).map(([level, items]) => ({
      level,
      count: items.length
    }))
  });
  
  // Log details if errors exist
  if (grouped[LogLevelEnum.ERROR]) {
    yield* askLogCreate(LogLevelEnum.ERROR, 'Batch errors', {
      errors: grouped[LogLevelEnum.ERROR]
    });
  }
}
```

### Correlation Tracking

```typescript
function* correlatedOperation(parentCorrelationId?: string) {
  const correlationId = parentCorrelationId || (yield* askNewGuid());
  
  yield* askContextProvide(correlationIdContext, correlationId);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Starting correlated operation', {
    correlationId,
    parentCorrelationId
  });
  
  // All subsequent logs will include correlationId from context
  yield* performOperation();
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Completed correlated operation', {
    correlationId
  });
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Good - appropriate levels
yield* askLogCreate(LogLevelEnum.DEBUG, 'Entering function', { params });
yield* askLogCreate(LogLevelEnum.INFO, 'User logged in', { userId });
yield* askLogCreate(LogLevelEnum.WARN, 'Rate limit approaching', { current, limit });
yield* askLogCreate(LogLevelEnum.ERROR, 'Database query failed', { error });

// Bad - wrong levels
yield* askLogCreate(LogLevelEnum.ERROR, 'User logged in'); // Should be INFO
yield* askLogCreate(LogLevelEnum.INFO, 'Fatal error'); // Should be FATAL
```

### 2. Include Structured Data

```typescript
// Good - structured data
yield* askLogCreate(LogLevelEnum.INFO, 'Order processed', {
  orderId: order.id,
  customerId: order.customerId,
  total: order.total,
  items: order.items.length
});

// Bad - unstructured
yield* askLogCreate(
  LogLevelEnum.INFO,
  `Order ${order.id} for customer ${order.customerId} total ${order.total}`
);
```

### 3. Avoid Logging Sensitive Data

```typescript
// Good - sanitized data
yield* askLogCreate(LogLevelEnum.INFO, 'User authenticated', {
  userId: user.id,
  email: user.email,
  loginMethod: 'password'
});

// Bad - sensitive data
yield* askLogCreate(LogLevelEnum.INFO, 'User authenticated', {
  userId: user.id,
  password: user.password, // Never log passwords
  creditCard: user.creditCard // Never log payment info
});
```

### 4. Use Context for Common Fields

```typescript
function* withLoggingContext(operation: Function) {
  const requestId = yield* askNewGuid();
  const startTime = yield* askDateNow();
  
  // Provide context that will be included in all logs
  yield* askContextProvide(requestIdContext, requestId);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Operation started', {
    requestId,
    startTime
  });
  
  return yield* operation();
}
```

## Testing

```typescript
describe('Log Actions', () => {
  test('creates log with data', () => {
    function* logOperation() {
      yield* askLogCreate(
        LogLevelEnum.INFO,
        'Test message',
        { key: 'value' }
      );
    }
    
    const story = logOperation();
    const { value: action } = story.next();
    
    expect(action.type).toBe('Log::Create');
    expect(action.payload.logLevel).toBe(LogLevelEnum.INFO);
    expect(action.payload.msg).toBe('Test message');
    expect(action.payload.data).toEqual({ key: 'value' });
  });
});
```

## Related Actions

- **Context Actions** - For correlation IDs
- **Error Actions** - For error logging
- **EventBus Actions** - For log aggregation
- **Date Actions** - For timestamps