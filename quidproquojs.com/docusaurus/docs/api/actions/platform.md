---
sidebar_position: 15
---

# Platform Actions

Perform platform-specific operations like delays and runtime information.

## Overview

Platform actions provide access to platform-specific functionality while maintaining portability across different runtime environments. These actions abstract timing operations and platform details.

## Available Actions

### askDelay

Pause execution for a specified duration.

#### Signature

```typescript
function* askDelay(timeMs: number): PlatformDelayActionRequester
```

#### Parameters

- **timeMs** (`number`): Delay duration in milliseconds

#### Returns

Returns `void` after the delay completes.

#### Example

```typescript
import { askDelay } from 'quidproquo-core';

// Simple delay
function* waitAndContinue() {
  yield* askLogCreate(LogLevelEnum.INFO, 'Starting operation');
  
  yield* askDelay(1000); // Wait 1 second
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Continuing after delay');
}

// Polling with delay
function* pollForCompletion(taskId: string, maxAttempts: number = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const task = yield* askKeyValueStoreGet('tasks', taskId);
    
    if (task.status === 'completed') {
      return task.result;
    }
    
    if (task.status === 'failed') {
      yield* askThrowError(ErrorTypeEnum.GenericError, 'Task failed');
    }
    
    // Wait before next check
    yield* askDelay(2000); // 2 seconds
  }
  
  yield* askThrowError(ErrorTypeEnum.TimeOut, 'Polling timeout');
}
```

## Usage Patterns

### Rate Limiting

```typescript
function* rateLimitedOperation<T>(
  items: T[],
  processor: (item: T) => Generator<any, any, any>,
  delayMs: number = 100
) {
  const results = [];
  
  for (const item of items) {
    results.push(yield* processor(item));
    
    // Rate limit between operations
    yield* askDelay(delayMs);
  }
  
  return results;
}

// Process API calls with rate limiting
function* processApiCalls(endpoints: string[]) {
  return yield* rateLimitedOperation(
    endpoints,
    function* (endpoint) {
      return yield* askNetworkRequest('GET', endpoint);
    },
    500 // 500ms between calls
  );
}
```

### Exponential Backoff

```typescript
function* exponentialBackoff(
  operation: () => Generator<any, any, any>,
  maxRetries: number = 5,
  baseDelayMs: number = 1000
) {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return yield* operation();
    } catch (error) {
      lastError = error;
      
      // Calculate exponential backoff with jitter
      const random = yield* askRandomNumber();
      const jitter = random * 0.3; // 30% jitter
      const delay = baseDelayMs * Math.pow(2, attempt) * (1 + jitter);
      
      yield* askLogCreate(LogLevelEnum.WARN, `Retry attempt ${attempt + 1}`, {
        delay,
        error: error.message
      });
      
      yield* askDelay(Math.floor(delay));
    }
  }
  
  throw lastError;
}
```

### Timeout Implementation

```typescript
function* withTimeout<T>(
  operation: () => Generator<any, T, any>,
  timeoutMs: number
) {
  let completed = false;
  let result: T;
  let error: any;
  
  // Run operation in parallel with timeout
  const operationPromise = (async () => {
    try {
      result = yield* operation();
      completed = true;
    } catch (e) {
      error = e;
      completed = true;
    }
  })();
  
  const timeoutPromise = (async () => {
    yield* askDelay(timeoutMs);
    if (!completed) {
      yield* askThrowError(
        ErrorTypeEnum.TimeOut,
        `Operation timed out after ${timeoutMs}ms`
      );
    }
  })();
  
  // Wait for either to complete
  yield* Promise.race([operationPromise, timeoutPromise]);
  
  if (error) throw error;
  return result!;
}
```

### Debouncing

```typescript
function* createDebouncer(delayMs: number) {
  let lastCallTime = 0;
  
  return function* debounced(
    operation: () => Generator<any, any, any>
  ) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < delayMs) {
      yield* askDelay(delayMs - timeSinceLastCall);
    }
    
    lastCallTime = Date.now();
    return yield* operation();
  };
}

// Usage
function* handleSearch(query: string) {
  const debounced = yield* createDebouncer(300);
  
  return yield* debounced(function* () {
    return yield* askNetworkRequest('GET', '/search', {
      params: { q: query }
    });
  });
}
```

### Throttling

```typescript
function* createThrottler(limitMs: number) {
  const queue: Array<() => void> = [];
  let processing = false;
  
  const processQueue = function* () {
    if (processing || queue.length === 0) return;
    
    processing = true;
    const operation = queue.shift()!;
    operation();
    
    yield* askDelay(limitMs);
    processing = false;
    
    yield* processQueue();
  };
  
  return function* throttled<T>(
    operation: () => Generator<any, T, any>
  ): Generator<any, T, any> {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = yield* operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      yield* processQueue();
    });
  };
}
```

### Animation and Transitions

```typescript
function* animateValue(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number) => Generator<any, void, any>
) {
  const steps = Math.ceil(durationMs / 16); // ~60fps
  const stepSize = (to - from) / steps;
  const stepDelay = durationMs / steps;
  
  for (let i = 0; i <= steps; i++) {
    const value = from + (stepSize * i);
    yield* onUpdate(value);
    
    if (i < steps) {
      yield* askDelay(stepDelay);
    }
  }
}

// Usage
function* fadeIn(elementId: string) {
  yield* animateValue(0, 1, 300, function* (opacity) {
    yield* askUpdateElementStyle(elementId, { opacity });
  });
}
```

### Scheduled Tasks

```typescript
function* scheduleTask(
  task: () => Generator<any, any, any>,
  scheduleTime: string
) {
  const now = yield* askDateNow();
  const delayMs = Date.parse(scheduleTime) - Date.parse(now);
  
  if (delayMs <= 0) {
    // Execute immediately if time has passed
    return yield* task();
  }
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Task scheduled', {
    scheduleTime,
    delayMs
  });
  
  yield* askDelay(delayMs);
  
  return yield* task();
}

// Recurring tasks
function* recurringTask(
  task: () => Generator<any, any, any>,
  intervalMs: number,
  times?: number
) {
  let count = 0;
  
  while (!times || count < times) {
    yield* task();
    count++;
    
    if (!times || count < times) {
      yield* askDelay(intervalMs);
    }
  }
}
```

### Performance Monitoring

```typescript
function* measurePerformance<T>(
  operation: () => Generator<any, T, any>,
  name: string
) {
  const startTime = Date.now();
  
  try {
    const result = yield* operation();
    
    const duration = Date.now() - startTime;
    
    // Add artificial delay if operation was too fast
    if (duration < 100) {
      yield* askDelay(100 - duration);
    }
    
    yield* askLogCreate(LogLevelEnum.INFO, `Performance: ${name}`, {
      durationMs: duration,
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    yield* askLogCreate(LogLevelEnum.ERROR, `Performance: ${name}`, {
      durationMs: duration,
      success: false,
      error: error.message
    });
    
    throw error;
  }
}
```

### Batch Processing with Delays

```typescript
function* processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Generator<any, R[], any>,
  delayBetweenBatches: number = 1000
) {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    yield* askLogCreate(LogLevelEnum.INFO, 'Processing batch', {
      batchNumber: Math.floor(i / batchSize) + 1,
      batchSize: batch.length,
      totalItems: items.length
    });
    
    const batchResults = yield* processor(batch);
    results.push(...batchResults);
    
    // Delay between batches (except for last batch)
    if (i + batchSize < items.length) {
      yield* askDelay(delayBetweenBatches);
    }
  }
  
  return results;
}
```

## Testing

```typescript
describe('Platform Actions', () => {
  test('delays execution', () => {
    function* delayedOperation() {
      const before = Date.now();
      yield* askDelay(100);
      const after = Date.now();
      return after - before;
    }
    
    const story = delayedOperation();
    const { value: action } = story.next();
    
    expect(action.type).toBe('Platform::Delay');
    expect(action.payload.timeMs).toBe(100);
    
    // Simulate delay completion
    story.next();
  });
  
  test('retry with delays', async () => {
    let attempts = 0;
    
    function* failingOperation() {
      attempts++;
      if (attempts < 3) {
        throw new Error('Failed');
      }
      return 'success';
    }
    
    function* retryWithDelay() {
      for (let i = 0; i < 3; i++) {
        try {
          return yield* failingOperation();
        } catch (error) {
          if (i < 2) {
            yield* askDelay(100);
          } else {
            throw error;
          }
        }
      }
    }
    
    // Test retry logic
  });
});
```

## Best Practices

### 1. Use Appropriate Delays

```typescript
// Good - reasonable delays
yield* askDelay(100); // 100ms for UI feedback
yield* askDelay(1000); // 1s for polling

// Bad - too short or too long
yield* askDelay(1); // Too short to be meaningful
yield* askDelay(3600000); // 1 hour - too long for most operations
```

### 2. Consider User Experience

```typescript
// Good - provide feedback during delays
function* longOperation() {
  yield* askLogCreate(LogLevelEnum.INFO, 'Starting long operation...');
  
  for (let i = 0; i < 10; i++) {
    yield* askDelay(1000);
    yield* askLogCreate(LogLevelEnum.INFO, `Progress: ${(i + 1) * 10}%`);
  }
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Operation complete');
}
```

### 3. Avoid Unnecessary Delays

```typescript
// Good - delay only when needed
if (needsRateLimit) {
  yield* askDelay(rateLimitMs);
}

// Bad - arbitrary delays
yield* askDelay(1000); // "Just to be safe"
```

## Related Actions

- **Date Actions** - For time calculations
- **Math Actions** - For random delays
- **Network Actions** - For request timeouts
- **Log Actions** - For delay logging