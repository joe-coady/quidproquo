---
sidebar_position: 5
---

# Context Actions

Share data across story boundaries without passing parameters, enabling clean separation of concerns.

## Overview

Context actions provide a way to share data throughout a story execution tree without explicitly passing it through every function. Similar to React Context or thread-local storage, context values are available to all child stories automatically. This is particularly useful for cross-cutting concerns like authentication, request IDs, feature flags, and user preferences.

## Core Concepts

### Context Identifiers

Context values are accessed through typed identifiers that ensure type safety:

```typescript
import { createContextIdentifier } from 'quidproquo-core';

// Create typed context identifiers
const userContext = createContextIdentifier<User>('user');
const requestIdContext = createContextIdentifier<string>('request-id');
const featureFlagsContext = createContextIdentifier<FeatureFlags>('feature-flags');
const localeContext = createContextIdentifier<string>('locale');
```

### Context Scope

Context values are scoped to the story execution tree:
- Parent stories can provide context values
- Child stories inherit context from parents
- Context values can be overridden in child scopes
- Context is automatically cleaned up after execution

## Available Actions

### askContextRead

Read a value from the context.

#### Signature

```typescript
function* askContextRead<T>(
  contextIdentifier: QpqContextIdentifier<T>
): Generator<ContextReadAction, T | undefined, any>
```

#### Parameters

- **contextIdentifier** (`QpqContextIdentifier<T>`): The typed context identifier

#### Returns

Returns the context value or `undefined` if not set.

#### Example

```typescript
import { askContextRead, createContextIdentifier } from 'quidproquo-core';

const userContext = createContextIdentifier<User>('user');

function* getCurrentUser() {
  const user = yield* askContextRead(userContext);
  if (!user) {
    yield* askThrowError('NO_USER', 'No user in context');
  }
  return user;
}

function* getUserPreferences() {
  const user = yield* askContextRead(userContext);
  const locale = yield* askContextRead(localeContext);
  
  return {
    userId: user?.id,
    language: locale || 'en',
    timezone: user?.timezone || 'UTC'
  };
}
```

### askContextList

List all available context identifiers.

#### Signature

```typescript
function* askContextList(): Generator<ContextListAction, string[], any>
```

#### Returns

Returns an array of context identifier keys currently available.

#### Example

```typescript
function* debugContext() {
  const contextKeys = yield* askContextList();
  
  yield* askLogCreate('DEBUG', `Available context: ${contextKeys.join(', ')}`);
  
  for (const key of contextKeys) {
    // Log each context value (for debugging)
    yield* askLogCreate('DEBUG', `Context[${key}]`);
  }
  
  return contextKeys;
}
```

## Context Providers

### Using askContextProvide (from stories)

Provide context values within stories:

```typescript
import { askContextProvide } from 'quidproquo-core/stories';

function* withUserContext(userId: string, operation: () => Generator<any, any, any>) {
  // Fetch user
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  
  // Provide user context for child stories
  yield* askContextProvide(userContext, user);
  
  // Execute operation with context
  const result = yield* operation();
  
  return result;
}

// Usage
function* performUserOperation(userId: string) {
  return yield* withUserContext(userId, function* () {
    // User is now available in context
    const user = yield* askContextRead(userContext);
    yield* askLogCreate('INFO', `Operating as user: ${user.name}`);
    
    // Do user-specific operations
    return yield* updateUserSettings();
  });
}
```

### Multiple Context Values

```typescript
function* withRequestContext(request: HTTPRequest, handler: Function) {
  // Provide multiple context values
  yield* askContextProvide(requestIdContext, request.requestId);
  yield* askContextProvide(userContext, request.user);
  yield* askContextProvide(localeContext, request.headers['accept-language']);
  yield* askContextProvide(featureFlagsContext, yield* loadFeatureFlags());
  
  // Execute handler with all context
  return yield* handler(request);
}
```

## Usage Patterns

### Authentication Context

```typescript
const authContext = createContextIdentifier<AuthInfo>('auth');

function* authenticatedRoute(request: HTTPRequest) {
  // Decode and validate token
  const token = request.headers.authorization;
  const authInfo = yield* askUserDirectoryDecodeAccessToken(token);
  
  // Provide auth context
  yield* askContextProvide(authContext, authInfo);
  
  // Process request with auth context
  return yield* handleRequest(request);
}

function* requireRole(role: string) {
  const auth = yield* askContextRead(authContext);
  
  if (!auth || !auth.roles.includes(role)) {
    yield* askThrowError('FORBIDDEN', `Role ${role} required`);
  }
  
  return auth;
}

function* adminOperation() {
  // Check admin role using context
  yield* requireRole('admin');
  
  // Perform admin operation
  return yield* deleteAllUsers();
}
```

### Request Tracking

```typescript
const correlationIdContext = createContextIdentifier<string>('correlation-id');
const requestTimeContext = createContextIdentifier<number>('request-time');

function* trackRequest(request: HTTPRequest, handler: Function) {
  const correlationId = request.headers['x-correlation-id'] || (yield* askGuidNew());
  const startTime = Date.now();
  
  // Provide tracking context
  yield* askContextProvide(correlationIdContext, correlationId);
  yield* askContextProvide(requestTimeContext, startTime);
  
  try {
    const result = yield* handler(request);
    
    // Log success with context
    const duration = Date.now() - startTime;
    yield* askLogCreate('INFO', `Request completed in ${duration}ms`, {
      correlationId,
      duration
    });
    
    return result;
  } catch (error) {
    // Log error with context
    yield* askLogCreate('ERROR', `Request failed: ${error.message}`, {
      correlationId,
      duration: Date.now() - startTime,
      error
    });
    throw error;
  }
}
```

### Feature Flags

```typescript
const featureFlagsContext = createContextIdentifier<FeatureFlags>('feature-flags');

interface FeatureFlags {
  newUI: boolean;
  betaFeatures: boolean;
  debugMode: boolean;
}

function* withFeatureFlags(userId: string, operation: Function) {
  // Load user-specific feature flags
  const flags = yield* askKeyValueStoreGet<FeatureFlags>('feature-flags', userId) || {
    newUI: false,
    betaFeatures: false,
    debugMode: false
  };
  
  yield* askContextProvide(featureFlagsContext, flags);
  
  return yield* operation();
}

function* conditionalFeature() {
  const flags = yield* askContextRead(featureFlagsContext);
  
  if (flags?.newUI) {
    return yield* renderNewUI();
  } else {
    return yield* renderLegacyUI();
  }
}
```

### Localization

```typescript
const localeContext = createContextIdentifier<string>('locale');
const translationsContext = createContextIdentifier<Translations>('translations');

function* withLocalization(locale: string, operation: Function) {
  // Load translations for locale
  const translations = yield* askFileReadObjectJson<Translations>(
    'translations',
    `${locale}.json`
  );
  
  yield* askContextProvide(localeContext, locale);
  yield* askContextProvide(translationsContext, translations);
  
  return yield* operation();
}

function* translate(key: string, params?: Record<string, any>) {
  const translations = yield* askContextRead(translationsContext);
  const locale = yield* askContextRead(localeContext);
  
  if (!translations) {
    return key; // Fallback to key
  }
  
  let text = translations[key] || key;
  
  // Replace parameters
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, value);
    }
  }
  
  return text;
}

function* sendWelcomeEmail(userId: string) {
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  
  const subject = yield* translate('email.welcome.subject');
  const body = yield* translate('email.welcome.body', {
    name: user.name
  });
  
  yield* askQueueSendMessage('email-queue', {
    to: user.email,
    subject,
    body
  });
}
```

### Database Transactions

```typescript
const transactionContext = createContextIdentifier<Transaction>('transaction');

function* withTransaction(operation: Function) {
  const transaction = yield* askBeginTransaction();
  
  try {
    yield* askContextProvide(transactionContext, transaction);
    
    const result = yield* operation();
    
    yield* askCommitTransaction(transaction);
    return result;
  } catch (error) {
    yield* askRollbackTransaction(transaction);
    throw error;
  }
}

function* createOrder(orderData: OrderInput) {
  return yield* withTransaction(function* () {
    const transaction = yield* askContextRead(transactionContext);
    
    // All operations use the same transaction from context
    const order = yield* askKeyValueStoreUpsert('orders', orderData, { transaction });
    yield* askKeyValueStoreUpdate('inventory', orderData.items, { transaction });
    yield* askKeyValueStoreUpdate('users', orderData.userId, { transaction });
    
    return order;
  });
}
```

## Testing Context

```typescript
describe('Context Actions', () => {
  test('provides context to child stories', () => {
    const userContext = createContextIdentifier<User>('user');
    const testUser = { id: '123', name: 'Test User' };
    
    function* parentStory() {
      yield* askContextProvide(userContext, testUser);
      return yield* childStory();
    }
    
    function* childStory() {
      return yield* askContextRead(userContext);
    }
    
    const story = parentStory();
    
    // Skip provide action
    story.next();
    
    // Child reads context
    const { value: readAction } = story.next();
    expect(readAction.type).toBe('Context::Read');
    
    // Provide context value
    const { value: result } = story.next(testUser);
    expect(result).toEqual(testUser);
  });
  
  test('context isolation between stories', async () => {
    const runtime = createTestRuntime();
    const context = createContextIdentifier<string>('test');
    
    function* story1() {
      yield* askContextProvide(context, 'value1');
      return yield* askContextRead(context);
    }
    
    function* story2() {
      return yield* askContextRead(context);
    }
    
    const result1 = await runtime.execute(story1);
    expect(result1).toBe('value1');
    
    const result2 = await runtime.execute(story2);
    expect(result2).toBeUndefined();
  });
});
```

## Best Practices

### 1. Define Context at Module Level

```typescript
// contexts.ts - Define all contexts in one place
export const contexts = {
  user: createContextIdentifier<User>('user'),
  auth: createContextIdentifier<AuthInfo>('auth'),
  locale: createContextIdentifier<string>('locale'),
  requestId: createContextIdentifier<string>('request-id'),
  featureFlags: createContextIdentifier<FeatureFlags>('feature-flags')
};
```

### 2. Create Context Providers

```typescript
// providers.ts - Reusable context providers
export function* withAuth(token: string, operation: Function) {
  const auth = yield* askUserDirectoryDecodeAccessToken(token);
  yield* askContextProvide(contexts.auth, auth);
  return yield* operation();
}

export function* withUser(userId: string, operation: Function) {
  const user = yield* askKeyValueStoreGet<User>('users', userId);
  yield* askContextProvide(contexts.user, user);
  return yield* operation();
}
```

### 3. Type-Safe Context Access

```typescript
// Always use typed identifiers
function* getUserName() {
  const user = yield* askContextRead(contexts.user);
  return user?.name || 'Anonymous';
}

// Never use string keys directly
function* bad() {
  // Don't do this - no type safety
  const user = yield* askContextRead('user' as any);
}
```

### 4. Handle Missing Context

```typescript
function* requireContext<T>(
  contextId: QpqContextIdentifier<T>,
  errorMessage: string
): Generator<any, T, any> {
  const value = yield* askContextRead(contextId);
  if (value === undefined) {
    yield* askThrowError('MISSING_CONTEXT', errorMessage);
  }
  return value;
}

function* protectedOperation() {
  const user = yield* requireContext(
    contexts.user,
    'User context required for this operation'
  );
  
  // User is guaranteed to be defined
  return yield* performOperation(user.id);
}
```

## Performance Considerations

Context is lightweight and efficient:
- Context values are stored in memory during execution
- No serialization overhead
- Automatic cleanup after story completion
- Minimal memory footprint

## Context vs Parameters

When to use context:
- ✅ Cross-cutting concerns (auth, logging, tracing)
- ✅ Values needed deep in call stack
- ✅ Optional configuration
- ✅ Request-scoped data

When to use parameters:
- ✅ Required business data
- ✅ Values that change frequently
- ✅ Direct dependencies
- ✅ Public API contracts

## Related Actions

- **State Actions** - For mutable state management
- **Config Actions** - For application configuration
- **User Directory Actions** - For authentication context
- **Log Actions** - For contextual logging