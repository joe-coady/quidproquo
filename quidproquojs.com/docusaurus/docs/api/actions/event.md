---
sidebar_position: 8
---

# Event Actions

Process and transform events from various sources with platform-agnostic event handling.

## Overview

Event actions provide a unified way to handle events across different platforms and runtimes. They abstract the complexity of event processing, transformation, and routing, allowing you to write event handlers that work consistently whether triggered by AWS Lambda, HTTP requests, queues, or other event sources.

## Core Concepts

### Event Records

Event records represent incoming events from various sources:
- HTTP requests
- Queue messages
- EventBus messages
- WebSocket connections
- Scheduled events
- File uploads

### Event Processing Pipeline

1. **Get Records** - Extract event records from the source
2. **Transform** - Convert platform-specific events to standard format
3. **Match Story** - Route events to appropriate handlers
4. **Process** - Execute business logic
5. **Transform Response** - Convert results to platform format
6. **Auto Respond** - Send responses automatically

## Available Actions

### askEventGetRecords

Get event records from the current event source.

#### Signature

```typescript
function* askEventGetRecords<EventParams extends Array<unknown>, QpqEventRecord>(
  ...eventParams: EventParams
): EventGetRecordsActionRequester<EventParams, QpqEventRecord>
```

#### Parameters

- **eventParams** (`EventParams`): Platform-specific event parameters

#### Returns

Returns an array of event records to process.

#### Example

```typescript
import { askEventGetRecords } from 'quidproquo-core';

function* processHttpRequest(event: any, context: any) {
  // Get HTTP request records from AWS Lambda event
  const records = yield* askEventGetRecords(event, context);
  
  for (const record of records) {
    yield* handleHttpRequest(record);
  }
}

function* processQueueMessages(messages: any[]) {
  // Get queue message records
  const records = yield* askEventGetRecords(messages);
  
  for (const record of records) {
    yield* processMessage(record);
  }
}
```

### askEventTransformEventParams

Transform platform-specific event parameters to standard format.

#### Signature

```typescript
function* askEventTransformEventParams<EventParams, TransformedEventParams>(
  eventParams: EventParams
): EventTransformEventParamsActionRequester<EventParams, TransformedEventParams>
```

#### Example

```typescript
function* transformAwsEvent(event: AWSLambdaEvent) {
  // Transform AWS Lambda event to standard format
  const transformed = yield* askEventTransformEventParams(event);
  
  return {
    method: transformed.httpMethod,
    path: transformed.path,
    headers: transformed.headers,
    body: transformed.body,
    query: transformed.queryStringParameters
  };
}
```

### askEventMatchStory

Match an event record to the appropriate story handler.

#### Signature

```typescript
function* askEventMatchStory<QpqEventRecord, MSR extends AnyMatchStoryResult, EventParams>(
  qpqEventRecord: QpqEventRecord,
  eventParams: EventParams
): EventMatchStoryActionRequester<QpqEventRecord, MSR, EventParams>
```

#### Example

```typescript
function* routeEvent(record: EventRecord, params: any) {
  // Match event to story based on routing rules
  const matchResult = yield* askEventMatchStory(record, params);
  
  if (matchResult.runtime) {
    // Execute matched story
    return yield* matchResult.runtime(record);
  }
  
  // No match found
  yield* askThrowError(ErrorTypeEnum.NotFound, 'No handler for event');
}
```

### askEventTransformEventRecord

Transform an event record for processing.

#### Signature

```typescript
function* askEventTransformEventRecord<QpqEventRecord, TransformedEventRecord>(
  qpqEventRecord: QpqEventRecord
): EventTransformEventRecordActionRequester<QpqEventRecord, TransformedEventRecord>
```

#### Example

```typescript
function* processEventRecord(record: RawEventRecord) {
  // Transform raw record to domain format
  const transformed = yield* askEventTransformEventRecord(record);
  
  return {
    id: transformed.messageId,
    timestamp: transformed.sentTimestamp,
    data: JSON.parse(transformed.body),
    attributes: transformed.messageAttributes
  };
}
```

### askEventTransformResponseResult

Transform processing results to response format.

#### Signature

```typescript
function* askEventTransformResponseResult<ResponseResult, TransformedResponseResult>(
  responseResult: ResponseResult
): EventTransformResponseResultActionRequester<ResponseResult, TransformedResponseResult>
```

#### Example

```typescript
function* formatApiResponse(result: any) {
  // Transform result to HTTP response format
  const response = yield* askEventTransformResponseResult(result);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(response)
  };
}
```

### askEventAutoRespond

Automatically send response based on platform.

#### Signature

```typescript
function* askEventAutoRespond<TransformedResponseResult, AutoRespondResult>(
  transformedResponseResult: TransformedResponseResult
): EventAutoRespondActionRequester<TransformedResponseResult, AutoRespondResult>
```

#### Example

```typescript
function* handleRequestWithAutoResponse(request: any) {
  const result = yield* processRequest(request);
  
  // Automatically respond based on platform
  // - HTTP: Send response with status code
  // - Queue: Acknowledge message
  // - EventBus: Publish response event
  return yield* askEventAutoRespond(result);
}
```

### askEventResolveCaughtError

Handle caught errors in event processing.

#### Signature

```typescript
function* askEventResolveCaughtError<TransformedEventParams>(
  error: QPQError
): EventResolveCaughtErrorActionRequester<TransformedEventParams>
```

#### Example

```typescript
function* safeEventHandler(event: any) {
  try {
    return yield* processEvent(event);
  } catch (error) {
    // Resolve error to appropriate response
    return yield* askEventResolveCaughtError(error);
  }
}
```

### askEventGetStorySession

Get the current story execution session.

#### Signature

```typescript
function* askEventGetStorySession(): EventGetStorySessionActionRequester
```

#### Example

```typescript
function* trackEventProcessing() {
  const session = yield* askEventGetStorySession();
  
  yield* askLogCreate('INFO', 'Processing event', {
    sessionId: session.id,
    startTime: session.startTime,
    correlation: session.correlationId
  });
  
  return session;
}
```

## Event Processing Patterns

### HTTP Request Handler

```typescript
function* httpEventHandler(event: AWSLambdaEvent, context: AWSContext) {
  // Transform AWS event to standard format
  const transformed = yield* askEventTransformEventParams(event, context);
  
  // Get request records
  const records = yield* askEventGetRecords(transformed);
  
  for (const record of records) {
    try {
      // Match to appropriate route handler
      const matchResult = yield* askEventMatchStory(record, transformed);
      
      if (!matchResult.runtime) {
        yield* askThrowError(ErrorTypeEnum.NotFound, 'Route not found');
      }
      
      // Execute handler
      const result = yield* matchResult.runtime(record);
      
      // Transform and auto-respond
      const response = yield* askEventTransformResponseResult(result);
      return yield* askEventAutoRespond(response);
      
    } catch (error) {
      // Handle errors gracefully
      return yield* askEventResolveCaughtError(error);
    }
  }
}
```

### Queue Message Processor

```typescript
function* queueEventProcessor(messages: QueueMessage[]) {
  const records = yield* askEventGetRecords(messages);
  const results = [];
  
  for (const record of records) {
    const session = yield* askEventGetStorySession();
    
    try {
      // Transform queue message
      const message = yield* askEventTransformEventRecord(record);
      
      // Process message
      yield* askLogCreate('INFO', `Processing message ${message.id}`, {
        sessionId: session.id
      });
      
      const result = yield* processQueueMessage(message);
      results.push({ success: true, messageId: message.id, result });
      
    } catch (error) {
      // Log failure but continue processing
      yield* askLogCreate('ERROR', `Failed to process message`, {
        sessionId: session.id,
        error: error.errorText
      });
      
      results.push({ success: false, messageId: record.id, error });
    }
  }
  
  return results;
}
```

### EventBus Handler

```typescript
function* eventBusHandler(eventBusMessage: EventBusMessage) {
  // Get event records
  const records = yield* askEventGetRecords(eventBusMessage);
  
  for (const record of records) {
    // Transform event
    const event = yield* askEventTransformEventRecord(record);
    
    // Route based on event type
    switch (event.type) {
      case 'USER_CREATED':
        yield* handleUserCreated(event.data);
        break;
        
      case 'ORDER_PLACED':
        yield* handleOrderPlaced(event.data);
        break;
        
      case 'PAYMENT_RECEIVED':
        yield* handlePaymentReceived(event.data);
        break;
        
      default:
        yield* askLogCreate('WARN', `Unknown event type: ${event.type}`);
    }
  }
}
```

### WebSocket Event Handler

```typescript
function* webSocketEventHandler(wsEvent: WebSocketEvent) {
  const records = yield* askEventGetRecords(wsEvent);
  
  for (const record of records) {
    const message = yield* askEventTransformEventRecord(record);
    
    switch (message.action) {
      case 'connect':
        yield* handleWebSocketConnect(message.connectionId);
        break;
        
      case 'disconnect':
        yield* handleWebSocketDisconnect(message.connectionId);
        break;
        
      case 'message':
        const response = yield* handleWebSocketMessage(
          message.connectionId,
          message.data
        );
        
        // Send response back through WebSocket
        yield* askWebSocketSendMessage(
          message.connectionId,
          response
        );
        break;
    }
  }
}
```

### Scheduled Event Handler

```typescript
function* scheduledEventHandler(scheduleEvent: ScheduledEvent) {
  const records = yield* askEventGetRecords(scheduleEvent);
  
  for (const record of records) {
    const schedule = yield* askEventTransformEventRecord(record);
    
    yield* askLogCreate('INFO', `Running scheduled task: ${schedule.name}`);
    
    try {
      switch (schedule.name) {
        case 'daily-cleanup':
          yield* performDailyCleanup();
          break;
          
        case 'hourly-sync':
          yield* performHourlySync();
          break;
          
        case 'weekly-report':
          yield* generateWeeklyReport();
          break;
      }
      
      // Mark schedule as completed
      yield* askKeyValueStoreUpdate('schedules', schedule.id, {
        lastRun: yield* askDateNow(),
        status: 'completed'
      });
      
    } catch (error) {
      // Mark schedule as failed
      yield* askKeyValueStoreUpdate('schedules', schedule.id, {
        lastRun: yield* askDateNow(),
        status: 'failed',
        error: error.errorText
      });
      
      throw error;
    }
  }
}
```

## Event Routing

### Dynamic Route Matching

```typescript
interface Route {
  path: string;
  method: string;
  handler: Function;
}

const routes: Route[] = [
  { path: '/users', method: 'GET', handler: listUsers },
  { path: '/users/:id', method: 'GET', handler: getUser },
  { path: '/users', method: 'POST', handler: createUser },
  { path: '/users/:id', method: 'PUT', handler: updateUser },
  { path: '/users/:id', method: 'DELETE', handler: deleteUser }
];

function* routeHttpRequest(request: HttpRequest) {
  // Match request to route
  const matchResult = yield* askEventMatchStory(request, routes);
  
  if (!matchResult.runtime) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Route not found' })
    };
  }
  
  // Extract route parameters
  const params = matchResult.runtimeOptions?.params || {};
  
  // Execute handler with parameters
  return yield* matchResult.runtime(request, params);
}
```

### Event Type Routing

```typescript
function* routeByEventType(event: DomainEvent) {
  const handlers = {
    'user.created': handleUserCreated,
    'user.updated': handleUserUpdated,
    'user.deleted': handleUserDeleted,
    'order.placed': handleOrderPlaced,
    'order.shipped': handleOrderShipped,
    'order.delivered': handleOrderDelivered
  };
  
  const handler = handlers[event.type];
  
  if (!handler) {
    yield* askLogCreate('WARN', `No handler for event type: ${event.type}`);
    return;
  }
  
  return yield* handler(event.data);
}
```

## Error Handling

### Graceful Error Recovery

```typescript
function* resilientEventHandler(event: any) {
  const session = yield* askEventGetStorySession();
  
  try {
    // Process event
    const result = yield* processEvent(event);
    
    // Transform and respond
    const response = yield* askEventTransformResponseResult(result);
    return yield* askEventAutoRespond(response);
    
  } catch (error) {
    // Log error with context
    yield* askLogCreate('ERROR', 'Event processing failed', {
      sessionId: session.id,
      event,
      error
    });
    
    // Attempt to resolve error to appropriate response
    try {
      return yield* askEventResolveCaughtError(error);
    } catch (resolveError) {
      // Fallback error response
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Internal server error',
          requestId: session.id
        })
      };
    }
  }
}
```

### Dead Letter Queue

```typescript
function* processWithDLQ(event: any) {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return yield* processEvent(event);
    } catch (error) {
      yield* askLogCreate('WARN', 
        `Attempt ${attempt} failed: ${error.errorText}`
      );
      
      if (attempt === maxRetries) {
        // Send to dead letter queue
        yield* askQueueSendMessage('dlq', {
          originalEvent: event,
          error: {
            type: error.errorType,
            message: error.errorText,
            attempts: maxRetries
          },
          timestamp: yield* askDateNow()
        });
        
        throw error;
      }
      
      // Exponential backoff
      yield* askPlatformDelay(Math.pow(2, attempt) * 1000);
    }
  }
}
```

## Testing

```typescript
describe('Event Actions', () => {
  test('processes event records', () => {
    function* handler(event: any) {
      const records = yield* askEventGetRecords(event);
      return records.length;
    }
    
    const story = handler({ messages: [1, 2, 3] });
    
    const { value: getRecordsAction } = story.next();
    expect(getRecordsAction.type).toBe('Event::GetRecords');
    
    const mockRecords = [
      { id: '1', data: 'a' },
      { id: '2', data: 'b' },
      { id: '3', data: 'c' }
    ];
    
    const { value: result } = story.next(mockRecords);
    expect(result).toBe(3);
  });
  
  test('transforms and auto-responds', () => {
    function* handler(data: any) {
      const transformed = yield* askEventTransformResponseResult(data);
      return yield* askEventAutoRespond(transformed);
    }
    
    const story = handler({ message: 'hello' });
    
    // Transform step
    const { value: transformAction } = story.next();
    expect(transformAction.type).toBe('Event::TransformResponseResult');
    
    const transformed = { statusCode: 200, body: 'hello' };
    
    // Auto-respond step
    story.next(transformed);
    const { value: respondAction } = story.next();
    expect(respondAction.type).toBe('Event::AutoRespond');
  });
});
```

## Best Practices

### 1. Always Handle Errors

```typescript
function* safeEventHandler(event: any) {
  try {
    return yield* processEvent(event);
  } catch (error) {
    return yield* askEventResolveCaughtError(error);
  }
}
```

### 2. Use Session for Correlation

```typescript
function* trackedEventHandler(event: any) {
  const session = yield* askEventGetStorySession();
  
  yield* askContextProvide(correlationIdContext, session.correlationId);
  
  // All logs will include correlation ID
  return yield* processEvent(event);
}
```

### 3. Transform at Boundaries

```typescript
function* boundaryHandler(platformEvent: any) {
  // Transform incoming
  const standardEvent = yield* askEventTransformEventParams(platformEvent);
  
  // Process in standard format
  const result = yield* processStandardEvent(standardEvent);
  
  // Transform outgoing
  const platformResponse = yield* askEventTransformResponseResult(result);
  
  return yield* askEventAutoRespond(platformResponse);
}
```

## Related Actions

- **EventBus Actions** - For pub/sub messaging
- **Queue Actions** - For message queuing
- **WebSocket Actions** - For real-time events
- **Error Actions** - For error handling
- **Log Actions** - For event logging