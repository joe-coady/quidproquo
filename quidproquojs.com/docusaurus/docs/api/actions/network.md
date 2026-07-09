---
sidebar_position: 14
---

# Network Actions

Make HTTP requests to external services with platform-agnostic networking.

## Overview

Network actions provide a consistent way to make HTTP requests across different platforms. Whether running in AWS Lambda, Node.js, or the browser, these actions abstract the underlying HTTP client while providing full control over requests and responses.

## Available Actions

### askNetworkRequest

Make an HTTP request to an external service.

#### Signature

```typescript
function* askNetworkRequest<T, R>(
  method: HTTPMethod,
  url: string,
  httpRequestOptions?: HTTPRequestOptions<T>
): NetworkRequestActionRequester<T, R>
```

#### Parameters

```typescript
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface HTTPRequestOptions<T> {
  body?: T;
  headers?: Record<string, string>;
  basePath?: string;
  params?: Record<string, string>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}
```

#### Returns

Returns the response body of type `R`.

#### Example

```typescript
import { askNetworkRequest } from 'quidproquo-core';

// Simple GET request
function* fetchUser(userId: string) {
  const user = yield* askNetworkRequest<void, User>(
    'GET',
    `https://api.example.com/users/${userId}`
  );
  
  return user;
}

// POST request with body
function* createUser(userData: CreateUserInput) {
  const response = yield* askNetworkRequest<CreateUserInput, User>(
    'POST',
    'https://api.example.com/users',
    {
      body: userData,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yield* getToken()}`
      }
    }
  );
  
  return response;
}

// Request with query parameters
function* searchUsers(query: string, limit: number = 10) {
  const results = yield* askNetworkRequest<void, User[]>(
    'GET',
    'https://api.example.com/users/search',
    {
      params: {
        q: query,
        limit: limit.toString(),
        offset: '0'
      }
    }
  );
  
  return results;
}
```

## Request Patterns

### REST API Integration

```typescript
class ApiClient {
  private baseUrl = 'https://api.example.com';
  
  *get<R>(path: string, params?: Record<string, string>) {
    return yield* askNetworkRequest<void, R>(
      'GET',
      `${this.baseUrl}${path}`,
      { params }
    );
  }
  
  *post<T, R>(path: string, body: T) {
    return yield* askNetworkRequest<T, R>(
      'POST',
      `${this.baseUrl}${path}`,
      {
        body,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  *put<T, R>(path: string, body: T) {
    return yield* askNetworkRequest<T, R>(
      'PUT',
      `${this.baseUrl}${path}`,
      {
        body,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  *delete<R>(path: string) {
    return yield* askNetworkRequest<void, R>(
      'DELETE',
      `${this.baseUrl}${path}`
    );
  }
}

// Usage
function* userOperations() {
  const client = new ApiClient();
  
  const users = yield* client.get<User[]>('/users');
  const newUser = yield* client.post<CreateUserInput, User>('/users', userData);
  const updated = yield* client.put<UpdateUserInput, User>(`/users/${id}`, updates);
  yield* client.delete(`/users/${id}`);
}
```

### Authentication

```typescript
function* authenticatedRequest<T, R>(
  method: HTTPMethod,
  url: string,
  options?: HTTPRequestOptions<T>
) {
  const token = yield* askContextRead(authTokenContext);
  
  if (!token) {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'No auth token');
  }
  
  return yield* askNetworkRequest<T, R>(method, url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}

// OAuth flow
function* oauthAuthenticate(clientId: string, clientSecret: string) {
  const response = yield* askNetworkRequest<any, TokenResponse>(
    'POST',
    'https://oauth.provider.com/token',
    {
      body: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  return response.access_token;
}
```

### Error Handling

```typescript
function* safeRequest<T, R>(
  method: HTTPMethod,
  url: string,
  options?: HTTPRequestOptions<T>
) {
  try {
    const response = yield* askNetworkRequest<T, R>(method, url, options);
    return { success: true, data: response };
  } catch (error) {
    yield* askLogCreate(LogLevelEnum.ERROR, 'Network request failed', {
      method,
      url,
      error: error.message
    });
    
    // Map HTTP errors to QPQ errors
    if (error.status === 404) {
      yield* askThrowError(ErrorTypeEnum.NotFound, 'Resource not found');
    } else if (error.status === 401) {
      yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Authentication failed');
    } else if (error.status >= 500) {
      yield* askThrowError(ErrorTypeEnum.GenericError, 'Server error');
    }
    
    return { success: false, error };
  }
}
```

### Retry Logic

```typescript
function* requestWithRetry<T, R>(
  method: HTTPMethod,
  url: string,
  options?: HTTPRequestOptions<T>,
  maxRetries: number = 3
) {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return yield* askNetworkRequest<T, R>(method, url, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      yield* askDelay(delay);
      
      yield* askLogCreate(LogLevelEnum.WARN, `Retry attempt ${attempt + 1}`, {
        url,
        delay
      });
    }
  }
  
  throw lastError;
}
```

### Pagination

```typescript
function* fetchAllPages<T>(baseUrl: string, pageSize: number = 100) {
  const allItems: T[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = yield* askNetworkRequest<void, PaginatedResponse<T>>(
      'GET',
      baseUrl,
      {
        params: {
          page: page.toString(),
          limit: pageSize.toString()
        }
      }
    );
    
    allItems.push(...response.items);
    hasMore = response.hasNextPage;
    page++;
    
    // Rate limiting
    yield* askDelay(100);
  }
  
  return allItems;
}
```

### Webhook Handling

```typescript
function* sendWebhook(webhookUrl: string, event: WebhookEvent) {
  const signature = yield* generateWebhookSignature(event);
  
  try {
    const response = yield* askNetworkRequest<WebhookEvent, void>(
      'POST',
      webhookUrl,
      {
        body: event,
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': yield* askDateNow()
        }
      }
    );
    
    yield* askLogCreate(LogLevelEnum.INFO, 'Webhook delivered', {
      url: webhookUrl,
      eventType: event.type
    });
    
    return response;
  } catch (error) {
    // Queue for retry
    yield* askQueueSendMessage('webhook-retry-queue', {
      webhookUrl,
      event,
      attempt: 1,
      error: error.message
    });
    
    throw error;
  }
}
```

### File Upload

```typescript
function* uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file.content, file.name);
  formData.append('metadata', JSON.stringify({
    size: file.size,
    type: file.type
  }));
  
  const response = yield* askNetworkRequest<FormData, UploadResponse>(
    'POST',
    'https://upload.example.com/files',
    {
      body: formData,
      headers: {
        // Don't set Content-Type for multipart/form-data
      }
    }
  );
  
  return response.fileId;
}
```

### GraphQL Requests

```typescript
function* graphqlQuery<T>(query: string, variables?: Record<string, any>) {
  const response = yield* askNetworkRequest<any, GraphQLResponse<T>>(
    'POST',
    'https://api.example.com/graphql',
    {
      body: {
        query,
        variables
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.errors) {
    yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      'GraphQL errors',
      JSON.stringify(response.errors)
    );
  }
  
  return response.data;
}

// Usage
function* fetchUserProfile(userId: string) {
  const query = `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
        posts {
          id
          title
        }
      }
    }
  `;
  
  return yield* graphqlQuery<User>(query, { id: userId });
}
```

## Testing

```typescript
describe('Network Actions', () => {
  test('makes GET request', () => {
    function* fetchData() {
      return yield* askNetworkRequest<void, any>(
        'GET',
        'https://api.example.com/data'
      );
    }
    
    const story = fetchData();
    const { value: action } = story.next();
    
    expect(action.type).toBe('Network::Request');
    expect(action.payload.method).toBe('GET');
    expect(action.payload.url).toBe('https://api.example.com/data');
    
    const mockResponse = { id: 1, name: 'Test' };
    const { value: result } = story.next(mockResponse);
    
    expect(result).toEqual(mockResponse);
  });
});
```

## Best Practices

### 1. Always Handle Errors

```typescript
// Good - proper error handling
try {
  const data = yield* askNetworkRequest('GET', url);
  return data;
} catch (error) {
  yield* askLogCreate(LogLevelEnum.ERROR, 'Request failed', { error });
  throw error;
}
```

### 2. Use Typed Responses

```typescript
// Good - typed request and response
const user = yield* askNetworkRequest<void, User>('GET', `/users/${id}`);

// Bad - untyped
const user = yield* askNetworkRequest('GET', `/users/${id}`);
```

### 3. Set Appropriate Headers

```typescript
// Good - explicit headers
yield* askNetworkRequest('POST', url, {
  body: data,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## Related Actions

- **Platform Actions** - For delays and timeouts
- **Log Actions** - For request logging
- **Error Actions** - For error handling
- **Context Actions** - For auth tokens