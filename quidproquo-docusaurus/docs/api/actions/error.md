---
sidebar_position: 7
---

# Error Actions

Handle errors consistently across all platforms with typed error handling and standardized error codes.

## Overview

Error actions provide a standardized way to throw and handle errors in Quidproquo applications. They ensure consistent error handling across different runtime environments (AWS Lambda, Node.js, browser) and provide typed error codes that map to appropriate HTTP status codes when used in web contexts.

## Error Types

Quidproquo defines standard error types that correspond to common HTTP status codes:

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `Unauthorized` | 401 | User failed to provide valid credentials |
| `PaymentRequired` | 402 | Payment is required to access resource |
| `Forbidden` | 403 | User lacks sufficient privileges |
| `NotFound` | 404 | Requested resource was not found |
| `TimeOut` | 408 | Server timed out waiting for response |
| `BadRequest` | 400 | Request included invalid data or parameters |
| `Invalid` | 422 | Request payload was invalid or unsupported format |
| `Conflict` | 409 | Resource already exists or conflicting changes |
| `UnsupportedMediaType` | 415 | Request included unsupported media type |
| `OutOfResources` | 503 | System or downstream resource exhausted |
| `GenericError` | 500 | Generic error (internal server error) |
| `NotImplemented` | 501 | Resource or action not yet implemented |
| `NoContent` | 204 | Successful but no content returned |

## Available Actions

### askThrowError

Throw an error with a specific type and message.

#### Signature

```typescript
function* askThrowError<T>(
  errorType: ErrorTypeEnum | string,
  errorText: string,
  errorStack?: string
): ErrorThrowErrorActionRequester<T>
```

#### Parameters

- **errorType** (`ErrorTypeEnum | string`): The error type (use ErrorTypeEnum for standard types)
- **errorText** (`string`): Human-readable error message
- **errorStack** (`string`, optional): Stack trace for debugging

#### Returns

Never returns (throws an error).

#### Example

```typescript
import { askThrowError, ErrorTypeEnum } from 'quidproquo-core';

function* validateUser(userId: string) {
  const user = yield* askKeyValueStoreGet('users', userId);
  
  if (!user) {
    yield* askThrowError(
      ErrorTypeEnum.NotFound,
      `User ${userId} not found`
    );
  }
  
  if (!user.isActive) {
    yield* askThrowError(
      ErrorTypeEnum.Forbidden,
      'User account is inactive'
    );
  }
  
  return user;
}

function* requireAuthentication(token?: string) {
  if (!token) {
    yield* askThrowError(
      ErrorTypeEnum.Unauthorized,
      'Authentication required'
    );
  }
  
  const decoded = yield* askUserDirectoryDecodeAccessToken(token);
  
  if (!decoded) {
    yield* askThrowError(
      ErrorTypeEnum.Unauthorized,
      'Invalid or expired token'
    );
  }
  
  return decoded;
}
```

## Error Handling Patterns

### Try-Catch in Stories

```typescript
function* safeOperation() {
  try {
    const result = yield* riskyOperation();
    return result;
  } catch (error) {
    // Handle QPQ errors
    if (error.errorType === ErrorTypeEnum.NotFound) {
      // Create default if not found
      return yield* createDefault();
    }
    
    // Log and re-throw other errors
    yield* askLogCreate('ERROR', `Operation failed: ${error.errorText}`);
    throw error;
  }
}
```

### Custom Error Types

```typescript
// Define custom error types for domain-specific errors
const VALIDATION_ERROR = 'VALIDATION_ERROR';
const BUSINESS_RULE_ERROR = 'BUSINESS_RULE_ERROR';
const RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR';

function* validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    yield* askThrowError(
      VALIDATION_ERROR,
      `Invalid email format: ${email}`
    );
  }
  
  return email;
}

function* checkRateLimit(userId: string) {
  const requests = yield* askKeyValueStoreGet('rate-limits', userId);
  
  if (requests && requests.count > 100) {
    yield* askThrowError(
      RATE_LIMIT_ERROR,
      'Rate limit exceeded. Please try again later.'
    );
  }
}
```

### Validation Errors

```typescript
interface ValidationError {
  field: string;
  message: string;
}

function* validateInput(input: any) {
  const errors: ValidationError[] = [];
  
  if (!input.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  if (!input.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(input.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (input.age && input.age < 18) {
    errors.push({ field: 'age', message: 'Must be 18 or older' });
  }
  
  if (errors.length > 0) {
    yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      'Validation failed',
      JSON.stringify(errors)
    );
  }
  
  return input;
}
```

### Authorization Checks

```typescript
function* requireRole(requiredRole: string) {
  const auth = yield* askContextRead(authContext);
  
  if (!auth) {
    yield* askThrowError(
      ErrorTypeEnum.Unauthorized,
      'Authentication required'
    );
  }
  
  if (!auth.roles.includes(requiredRole)) {
    yield* askThrowError(
      ErrorTypeEnum.Forbidden,
      `Role '${requiredRole}' required`
    );
  }
  
  return auth;
}

function* requireOwnership(resourceId: string, userId: string) {
  const resource = yield* askKeyValueStoreGet('resources', resourceId);
  
  if (!resource) {
    yield* askThrowError(
      ErrorTypeEnum.NotFound,
      `Resource ${resourceId} not found`
    );
  }
  
  if (resource.ownerId !== userId) {
    yield* askThrowError(
      ErrorTypeEnum.Forbidden,
      'You do not own this resource'
    );
  }
  
  return resource;
}
```

### Resource Limits

```typescript
function* checkQuota(userId: string, resourceType: string) {
  const usage = yield* askKeyValueStoreGet('usage', `${userId}:${resourceType}`);
  const limits = yield* askConfigGetParameter('quota-limits');
  
  if (usage && usage.count >= limits[resourceType]) {
    yield* askThrowError(
      ErrorTypeEnum.PaymentRequired,
      `${resourceType} quota exceeded. Please upgrade your plan.`
    );
  }
}

function* checkSystemResources() {
  const metrics = yield* askSystemGetMetrics();
  
  if (metrics.memoryUsage > 0.9) {
    yield* askThrowError(
      ErrorTypeEnum.OutOfResources,
      'System memory exhausted'
    );
  }
  
  if (metrics.cpuUsage > 0.95) {
    yield* askThrowError(
      ErrorTypeEnum.OutOfResources,
      'CPU resources exhausted'
    );
  }
}
```

### Timeout Handling

```typescript
function* withTimeout<T>(
  operation: () => Generator<any, T, any>,
  timeoutMs: number
) {
  const startTime = yield* askDateNow();
  
  // Set up timeout check
  const timeoutCheck = function* () {
    yield* askPlatformDelay(timeoutMs);
    yield* askThrowError(
      ErrorTypeEnum.TimeOut,
      `Operation timed out after ${timeoutMs}ms`
    );
  };
  
  // Race between operation and timeout
  return yield* askRace([operation(), timeoutCheck()]);
}

function* fetchWithTimeout(url: string) {
  return yield* withTimeout(
    function* () {
      return yield* askNetworkRequest({ url });
    },
    5000 // 5 second timeout
  );
}
```

## Error Recovery

### Retry Logic

```typescript
function* retryWithBackoff<T>(
  operation: () => Generator<any, T, any>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
) {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return yield* operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors
      if (error.errorType === ErrorTypeEnum.BadRequest ||
          error.errorType === ErrorTypeEnum.Unauthorized ||
          error.errorType === ErrorTypeEnum.Forbidden) {
        throw error;
      }
      
      // Calculate exponential backoff
      const delay = baseDelayMs * Math.pow(2, attempt);
      
      yield* askLogCreate('WARN', 
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms`,
        { error: error.errorText }
      );
      
      yield* askPlatformDelay(delay);
    }
  }
  
  // All retries exhausted
  yield* askThrowError(
    ErrorTypeEnum.GenericError,
    `Operation failed after ${maxRetries} attempts: ${lastError.errorText}`
  );
}
```

### Fallback Strategies

```typescript
function* getDataWithFallback(primarySource: string, fallbackSource: string) {
  try {
    // Try primary source
    return yield* askKeyValueStoreGet('primary-store', primarySource);
  } catch (error) {
    yield* askLogCreate('WARN', 
      `Primary source failed: ${error.errorText}, trying fallback`
    );
    
    try {
      // Try fallback source
      return yield* askKeyValueStoreGet('fallback-store', fallbackSource);
    } catch (fallbackError) {
      // Both failed
      yield* askThrowError(
        ErrorTypeEnum.GenericError,
        'Both primary and fallback sources failed'
      );
    }
  }
}
```

### Circuit Breaker

```typescript
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

function* withCircuitBreaker<T>(
  operation: () => Generator<any, T, any>,
  breakerId: string,
  threshold: number = 5,
  resetTimeMs: number = 60000
) {
  const state = yield* askKeyValueStoreGet<CircuitBreakerState>(
    'circuit-breakers',
    breakerId
  ) || { failures: 0, state: 'CLOSED', lastFailureTime: '' };
  
  // Check if circuit is open
  if (state.state === 'OPEN') {
    const now = yield* askDateNow();
    const timeSinceFailure = Date.parse(now) - Date.parse(state.lastFailureTime);
    
    if (timeSinceFailure < resetTimeMs) {
      yield* askThrowError(
        ErrorTypeEnum.OutOfResources,
        'Circuit breaker is OPEN - service unavailable'
      );
    }
    
    // Try half-open
    state.state = 'HALF_OPEN';
  }
  
  try {
    const result = yield* operation();
    
    // Success - reset circuit
    if (state.failures > 0) {
      yield* askKeyValueStoreUpsert('circuit-breakers', breakerId, {
        failures: 0,
        state: 'CLOSED',
        lastFailureTime: ''
      });
    }
    
    return result;
  } catch (error) {
    // Increment failures
    state.failures++;
    state.lastFailureTime = yield* askDateNow();
    
    if (state.failures >= threshold) {
      state.state = 'OPEN';
    }
    
    yield* askKeyValueStoreUpsert('circuit-breakers', breakerId, state);
    throw error;
  }
}
```

## Error Enrichment

### Adding Context

```typescript
function* enrichError(error: any, context: Record<string, any>) {
  const enriched = {
    ...error,
    context,
    timestamp: yield* askDateNow(),
    requestId: yield* askContextRead(requestIdContext),
    userId: yield* askContextRead(userContext)?.id
  };
  
  // Log enriched error
  yield* askLogCreate('ERROR', 'Enriched error', enriched);
  
  // Re-throw with additional context in stack
  yield* askThrowError(
    error.errorType,
    error.errorText,
    JSON.stringify(enriched)
  );
}

function* operationWithContext() {
  try {
    return yield* someOperation();
  } catch (error) {
    yield* enrichError(error, {
      operation: 'someOperation',
      input: { /* operation input */ }
    });
  }
}
```

## API Error Responses

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

function* handleApiError(error: any): Generator<any, ErrorResponse, any> {
  const requestId = yield* askContextRead(requestIdContext);
  const timestamp = yield* askDateNow();
  
  // Map error types to HTTP status codes
  const statusMap: Record<string, number> = {
    [ErrorTypeEnum.Unauthorized]: 401,
    [ErrorTypeEnum.PaymentRequired]: 402,
    [ErrorTypeEnum.Forbidden]: 403,
    [ErrorTypeEnum.NotFound]: 404,
    [ErrorTypeEnum.BadRequest]: 400,
    [ErrorTypeEnum.Invalid]: 422,
    [ErrorTypeEnum.Conflict]: 409,
    [ErrorTypeEnum.TimeOut]: 408,
    [ErrorTypeEnum.UnsupportedMediaType]: 415,
    [ErrorTypeEnum.OutOfResources]: 503,
    [ErrorTypeEnum.NotImplemented]: 501,
    [ErrorTypeEnum.GenericError]: 500
  };
  
  const statusCode = statusMap[error.errorType] || 500;
  
  return {
    statusCode,
    body: JSON.stringify({
      error: {
        type: error.errorType,
        message: error.errorText,
        details: error.errorStack ? JSON.parse(error.errorStack) : undefined
      },
      timestamp,
      requestId
    })
  };
}
```

## Testing

```typescript
describe('Error Actions', () => {
  test('throws typed error', () => {
    function* failingOperation() {
      yield* askThrowError(
        ErrorTypeEnum.NotFound,
        'Resource not found'
      );
    }
    
    const story = failingOperation();
    const { value: errorAction } = story.next();
    
    expect(errorAction.type).toBe('Error::ThrowError');
    expect(errorAction.payload.errorType).toBe(ErrorTypeEnum.NotFound);
    expect(errorAction.payload.errorText).toBe('Resource not found');
  });
  
  test('handles errors in try-catch', () => {
    function* safeOperation() {
      try {
        yield* askThrowError(ErrorTypeEnum.BadRequest, 'Invalid input');
      } catch (error) {
        return { caught: true, error };
      }
    }
    
    const story = safeOperation();
    story.next(); // Throw error
    
    const error = {
      errorType: ErrorTypeEnum.BadRequest,
      errorText: 'Invalid input'
    };
    
    const { value: result } = story.throw(error);
    expect(result.caught).toBe(true);
    expect(result.error.errorType).toBe(ErrorTypeEnum.BadRequest);
  });
});
```

## Best Practices

### 1. Use Standard Error Types

```typescript
// Good - use ErrorTypeEnum
yield* askThrowError(ErrorTypeEnum.NotFound, 'User not found');

// Avoid - custom strings unless necessary
yield* askThrowError('USER_NOT_FOUND', 'User not found');
```

### 2. Provide Meaningful Messages

```typescript
// Good - specific and actionable
yield* askThrowError(
  ErrorTypeEnum.BadRequest,
  `Email address '${email}' is not valid. Please use format: user@example.com`
);

// Bad - vague
yield* askThrowError(ErrorTypeEnum.BadRequest, 'Invalid input');
```

### 3. Include Debug Information

```typescript
// Include context in error stack for debugging
yield* askThrowError(
  ErrorTypeEnum.GenericError,
  'Database operation failed',
  JSON.stringify({
    operation: 'update',
    table: 'users',
    userId,
    timestamp: yield* askDateNow(),
    attempt: retryCount
  })
);
```

### 4. Handle Errors at Appropriate Level

```typescript
// Handle at route level for API responses
function* apiRoute(request: any) {
  try {
    return yield* processRequest(request);
  } catch (error) {
    return yield* handleApiError(error);
  }
}

// Let errors bubble up in internal functions
function* internalFunction() {
  // Don't catch here unless you can handle it
  const data = yield* fetchData();
  return processData(data);
}
```

## Related Actions

- **Event Actions** - For error event handling
- **Log Actions** - For error logging
- **Context Actions** - For error context
- **Platform Actions** - For error recovery delays