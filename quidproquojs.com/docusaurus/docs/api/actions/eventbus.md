---
sidebar_position: 9
---

# EventBus Actions

Publish and subscribe to domain events across your application with platform-agnostic pub/sub messaging.

## Overview

EventBus actions provide a publish-subscribe messaging pattern for decoupled, event-driven architectures. Events published to an EventBus are delivered to all subscribed services, enabling loose coupling between components. The EventBus abstraction works across different platforms, mapping to AWS EventBridge, Google Cloud Pub/Sub, Azure Event Grid, or local implementations.

## Core Concepts

### EventBus

An EventBus is a named channel for publishing events. Each EventBus can have multiple subscribers that receive all events published to it.

### Event Messages

Event messages are structured payloads that include:
- Event type/source
- Event data
- Metadata (timestamp, correlation ID, etc.)
- Context from the publishing story

### Fan-out Pattern

When an event is published, it's delivered to all subscribers:
- Each subscriber processes events independently
- Subscribers can filter events by type
- Failed processing doesn't affect other subscribers

## Available Actions

### askEventBusSendMessages

Publish one or more messages to an EventBus.

#### Signature

```typescript
function* askEventBusSendMessages<T>(
  eventBusSendMessageOptions: EventBusSendMessageOptions<T>
): EventBusSendMessageActionRequester<T>
```

#### Parameters

```typescript
interface EventBusSendMessageOptions<T> {
  eventBusName: string;
  eventBusMessages: EventBusMessage<T>[];
}

interface EventBusMessage<T> {
  source?: string;
  type?: string;
  data: T;
  metadata?: Record<string, any>;
}
```

- **eventBusName** (`string`): Name of the EventBus to publish to
- **eventBusMessages** (`EventBusMessage<T>[]`): Array of messages to publish

#### Returns

Returns `void` when messages are successfully published.

#### Example

```typescript
import { askEventBusSendMessages } from 'quidproquo-core';

// Helper for single message
function* askEventBusSendMessage<T>(
  eventBusName: string,
  message: EventBusMessage<T>
) {
  return yield* askEventBusSendMessages({
    eventBusName,
    eventBusMessages: [message]
  });
}

// Publish a single event
function* publishUserCreatedEvent(user: User) {
  yield* askEventBusSendMessage('user-events', {
    source: 'user-service',
    type: 'USER_CREATED',
    data: {
      userId: user.id,
      email: user.email,
      createdAt: yield* askDateNow()
    }
  });
}

// Publish multiple events
function* publishOrderEvents(order: Order) {
  yield* askEventBusSendMessages({
    eventBusName: 'order-events',
    eventBusMessages: [
      {
        type: 'ORDER_CREATED',
        data: { orderId: order.id, customerId: order.customerId }
      },
      {
        type: 'INVENTORY_RESERVED',
        data: { orderId: order.id, items: order.items }
      },
      {
        type: 'PAYMENT_REQUESTED',
        data: { orderId: order.id, amount: order.total }
      }
    ]
  });
}
```

## Event Patterns

### Domain Events

```typescript
// Define event types
interface UserEvent {
  userId: string;
  timestamp: string;
}

interface UserCreatedEvent extends UserEvent {
  email: string;
  name: string;
}

interface UserUpdatedEvent extends UserEvent {
  changes: Record<string, any>;
}

interface UserDeletedEvent extends UserEvent {
  deletedBy: string;
}

// Event publisher
function* publishUserEvent(
  eventType: string,
  eventData: UserEvent
) {
  const correlationId = yield* askContextRead(correlationIdContext);
  
  yield* askEventBusSendMessage('user-events', {
    source: 'user-service',
    type: eventType,
    data: eventData,
    metadata: {
      correlationId,
      timestamp: yield* askDateNow(),
      version: '1.0'
    }
  });
}

// Usage in user operations
function* createUser(userData: CreateUserInput) {
  const user = yield* askKeyValueStoreUpsert('users', {
    id: yield* askGuidNew(),
    ...userData,
    createdAt: yield* askDateNow()
  });
  
  // Publish event
  yield* publishUserEvent('USER_CREATED', {
    userId: user.id,
    email: user.email,
    name: user.name,
    timestamp: user.createdAt
  });
  
  return user;
}
```

### Event Sourcing

```typescript
interface Event {
  aggregateId: string;
  eventType: string;
  eventData: any;
  eventVersion: number;
  timestamp: string;
}

function* appendEvent(event: Event) {
  // Store event in event store
  yield* askKeyValueStoreUpsert('event-store', {
    id: yield* askGuidNew(),
    ...event
  });
  
  // Publish to EventBus for projections
  yield* askEventBusSendMessage('event-stream', {
    type: event.eventType,
    data: event,
    metadata: {
      aggregateId: event.aggregateId,
      version: event.eventVersion
    }
  });
}

function* replayEvents(aggregateId: string) {
  const events = yield* askKeyValueStoreQuery('event-store', {
    filterCondition: {
      key: 'aggregateId',
      operation: '=',
      valueA: aggregateId
    },
    sortCondition: {
      key: 'eventVersion',
      direction: 'asc'
    }
  });
  
  // Rebuild aggregate state from events
  let state = {};
  for (const event of events.items) {
    state = applyEvent(state, event);
  }
  
  return state;
}
```

### CQRS Pattern

```typescript
// Command side - writes trigger events
function* executeCommand(command: Command) {
  // Validate command
  yield* validateCommand(command);
  
  // Execute business logic
  const result = yield* processCommand(command);
  
  // Publish events for read side
  yield* askEventBusSendMessage('domain-events', {
    type: `${command.type}_COMPLETED`,
    data: {
      commandId: command.id,
      result,
      timestamp: yield* askDateNow()
    }
  });
  
  return result;
}

// Query side - subscribes to events
function* updateReadModel(event: DomainEvent) {
  switch (event.type) {
    case 'ORDER_CREATED':
      yield* askKeyValueStoreUpsert('order-projections', {
        orderId: event.data.orderId,
        status: 'pending',
        customerName: event.data.customerName,
        total: event.data.total
      });
      break;
      
    case 'ORDER_SHIPPED':
      yield* askKeyValueStoreUpdate('order-projections', 
        event.data.orderId,
        { status: 'shipped', shippedAt: event.data.timestamp }
      );
      break;
  }
}
```

### Saga Orchestration

```typescript
interface SagaStep {
  service: string;
  action: string;
  compensate?: string;
}

function* executeSaga(sagaId: string, steps: SagaStep[]) {
  const completedSteps: SagaStep[] = [];
  
  try {
    for (const step of steps) {
      // Publish step execution event
      yield* askEventBusSendMessage('saga-events', {
        type: 'SAGA_STEP_STARTED',
        data: { sagaId, step }
      });
      
      // Wait for step completion
      const result = yield* waitForStepCompletion(sagaId, step);
      
      completedSteps.push(step);
      
      // Publish step completed event
      yield* askEventBusSendMessage('saga-events', {
        type: 'SAGA_STEP_COMPLETED',
        data: { sagaId, step, result }
      });
    }
    
    // Saga completed successfully
    yield* askEventBusSendMessage('saga-events', {
      type: 'SAGA_COMPLETED',
      data: { sagaId, completedSteps }
    });
    
  } catch (error) {
    // Compensate completed steps in reverse order
    for (const step of completedSteps.reverse()) {
      if (step.compensate) {
        yield* askEventBusSendMessage('saga-events', {
          type: 'SAGA_COMPENSATION',
          data: { sagaId, step, action: step.compensate }
        });
      }
    }
    
    // Saga failed
    yield* askEventBusSendMessage('saga-events', {
      type: 'SAGA_FAILED',
      data: { sagaId, error: error.message }
    });
    
    throw error;
  }
}
```

### Event Aggregation

```typescript
function* aggregateMetrics(timeWindow: number) {
  const events: any[] = [];
  const startTime = yield* askDateNow();
  
  // Collect events for time window
  while (true) {
    const now = yield* askDateNow();
    const elapsed = Date.parse(now) - Date.parse(startTime);
    
    if (elapsed >= timeWindow) {
      break;
    }
    
    // Collect events (pseudo-code)
    const newEvents = yield* collectEvents();
    events.push(...newEvents);
    
    yield* askPlatformDelay(1000); // Check every second
  }
  
  // Aggregate and publish
  const metrics = {
    eventCount: events.length,
    eventTypes: groupBy(events, 'type'),
    timeWindow,
    startTime,
    endTime: yield* askDateNow()
  };
  
  yield* askEventBusSendMessage('metrics-events', {
    type: 'METRICS_AGGREGATED',
    data: metrics
  });
  
  return metrics;
}
```

### Notification Broadcasting

```typescript
function* broadcastNotification(
  notification: Notification,
  channels: string[]
) {
  const messages = channels.map(channel => ({
    type: 'NOTIFICATION',
    source: 'notification-service',
    data: {
      ...notification,
      channel,
      timestamp: yield* askDateNow()
    }
  }));
  
  // Send to all channels simultaneously
  yield* askEventBusSendMessages({
    eventBusName: 'notification-events',
    eventBusMessages: messages
  });
  
  // Log notification sent
  yield* askLogCreate('INFO', 
    `Notification ${notification.id} sent to ${channels.length} channels`
  );
}

// Subscribe to notifications in different services
function* emailNotificationHandler(event: NotificationEvent) {
  if (event.data.channel !== 'email') return;
  
  yield* askQueueSendMessage('email-queue', {
    to: event.data.recipient,
    subject: event.data.title,
    body: event.data.message
  });
}

function* smsNotificationHandler(event: NotificationEvent) {
  if (event.data.channel !== 'sms') return;
  
  yield* askNetworkRequest({
    method: 'POST',
    url: 'https://sms-api.com/send',
    body: {
      phone: event.data.recipient,
      message: event.data.message
    }
  });
}
```

### Audit Trail

```typescript
interface AuditEvent {
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  changes?: Record<string, any>;
  timestamp: string;
}

function* auditOperation<T>(
  operation: () => Generator<any, T, any>,
  auditInfo: Omit<AuditEvent, 'timestamp'>
) {
  const startTime = yield* askDateNow();
  
  try {
    const result = yield* operation();
    
    // Publish audit event
    yield* askEventBusSendMessage('audit-events', {
      type: 'AUDIT_EVENT',
      data: {
        ...auditInfo,
        timestamp: startTime,
        success: true,
        duration: Date.parse(yield* askDateNow()) - Date.parse(startTime)
      }
    });
    
    return result;
  } catch (error) {
    // Audit failure
    yield* askEventBusSendMessage('audit-events', {
      type: 'AUDIT_EVENT',
      data: {
        ...auditInfo,
        timestamp: startTime,
        success: false,
        error: error.message,
        duration: Date.parse(yield* askDateNow()) - Date.parse(startTime)
      }
    });
    
    throw error;
  }
}

// Usage
function* updateUserWithAudit(userId: string, updates: any) {
  const currentUser = yield* askContextRead(userContext);
  
  return yield* auditOperation(
    function* () {
      return yield* askKeyValueStoreUpdate('users', userId, updates);
    },
    {
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      userId: currentUser.id,
      changes: updates
    }
  );
}
```

### Event Filtering

```typescript
// Subscriber can filter events
function* handleUserEvents(event: EventBusMessage<any>) {
  // Filter by event type
  const relevantTypes = ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED'];
  
  if (!relevantTypes.includes(event.type)) {
    return; // Ignore other events
  }
  
  // Filter by metadata
  if (event.metadata?.version !== '1.0') {
    yield* askLogCreate('WARN', `Unsupported event version: ${event.metadata?.version}`);
    return;
  }
  
  // Process relevant events
  switch (event.type) {
    case 'USER_CREATED':
      yield* onUserCreated(event.data);
      break;
    case 'USER_UPDATED':
      yield* onUserUpdated(event.data);
      break;
    case 'USER_DELETED':
      yield* onUserDeleted(event.data);
      break;
  }
}
```

## Integration Patterns

### Cross-Service Communication

```typescript
// Service A publishes order events
function* orderService() {
  function* createOrder(orderData: any) {
    const order = yield* askKeyValueStoreUpsert('orders', orderData);
    
    yield* askEventBusSendMessage('order-events', {
      type: 'ORDER_PLACED',
      data: order
    });
    
    return order;
  }
}

// Service B subscribes to order events
function* inventoryService() {
  function* handleOrderEvent(event: EventBusMessage<any>) {
    if (event.type === 'ORDER_PLACED') {
      yield* reserveInventory(event.data.items);
      
      yield* askEventBusSendMessage('inventory-events', {
        type: 'INVENTORY_RESERVED',
        data: { orderId: event.data.id }
      });
    }
  }
}

// Service C subscribes to multiple event types
function* billingService() {
  function* handleEvents(event: EventBusMessage<any>) {
    switch (event.type) {
      case 'ORDER_PLACED':
        yield* createInvoice(event.data);
        break;
      case 'INVENTORY_RESERVED':
        yield* chargeCustomer(event.data.orderId);
        break;
    }
  }
}
```

### Dead Letter Handling

```typescript
function* processEventWithRetry(event: EventBusMessage<any>) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return yield* processEvent(event);
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        // Send to dead letter queue
        yield* askEventBusSendMessage('dead-letter-events', {
          type: 'PROCESSING_FAILED',
          data: {
            originalEvent: event,
            error: error.message,
            attempts: attempt,
            timestamp: yield* askDateNow()
          }
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
describe('EventBus Actions', () => {
  test('publishes single event', () => {
    function* publishEvent() {
      yield* askEventBusSendMessages({
        eventBusName: 'test-events',
        eventBusMessages: [{
          type: 'TEST_EVENT',
          data: { test: true }
        }]
      });
    }
    
    const story = publishEvent();
    
    // First yield: get context
    const { value: contextAction } = story.next();
    expect(contextAction.type).toBe('Context::List');
    
    // Provide context
    story.next({});
    
    // Second yield: send messages
    const { value: sendAction } = story.next();
    expect(sendAction.type).toBe('EventBus::SendMessages');
    expect(sendAction.payload.eventBusName).toBe('test-events');
    expect(sendAction.payload.eventBusMessages).toHaveLength(1);
  });
  
  test('includes context in messages', () => {
    function* publishWithContext() {
      yield* askContextProvide(userContext, { id: 'user123' });
      
      yield* askEventBusSendMessages({
        eventBusName: 'test-events',
        eventBusMessages: [{ data: 'test' }]
      });
    }
    
    // Context is automatically included with messages
  });
});
```

## Best Practices

### 1. Use Consistent Event Schema

```typescript
interface StandardEvent<T> {
  eventId: string;
  eventType: string;
  eventVersion: string;
  source: string;
  timestamp: string;
  correlationId?: string;
  data: T;
}

function* publishStandardEvent<T>(
  eventBusName: string,
  eventType: string,
  data: T
) {
  const event: StandardEvent<T> = {
    eventId: yield* askGuidNew(),
    eventType,
    eventVersion: '1.0',
    source: 'my-service',
    timestamp: yield* askDateNow(),
    correlationId: yield* askContextRead(correlationIdContext),
    data
  };
  
  yield* askEventBusSendMessage(eventBusName, event);
}
```

### 2. Make Events Self-Contained

```typescript
// Good - event contains all needed data
yield* askEventBusSendMessage('order-events', {
  type: 'ORDER_SHIPPED',
  data: {
    orderId: order.id,
    customerId: order.customerId,
    customerEmail: customer.email,
    trackingNumber: shipment.trackingNumber,
    carrier: shipment.carrier
  }
});

// Bad - requires additional lookups
yield* askEventBusSendMessage('order-events', {
  type: 'ORDER_SHIPPED',
  data: { orderId: order.id } // Missing customer and shipment info
});
```

### 3. Version Your Events

```typescript
function* handleVersionedEvent(event: EventBusMessage<any>) {
  const version = event.metadata?.version || '1.0';
  
  switch (version) {
    case '1.0':
      return yield* handleV1Event(event);
    case '2.0':
      return yield* handleV2Event(event);
    default:
      yield* askLogCreate('WARN', `Unknown event version: ${version}`);
  }
}
```

### 4. Idempotent Event Handlers

```typescript
function* idempotentEventHandler(event: EventBusMessage<any>) {
  const eventId = event.metadata?.eventId;
  
  // Check if already processed
  const processed = yield* askKeyValueStoreGet('processed-events', eventId);
  if (processed) {
    yield* askLogCreate('INFO', `Event ${eventId} already processed`);
    return;
  }
  
  // Process event
  const result = yield* processEvent(event);
  
  // Mark as processed
  yield* askKeyValueStoreUpsert('processed-events', {
    id: eventId,
    processedAt: yield* askDateNow(),
    result
  });
  
  return result;
}
```

## Related Actions

- **Queue Actions** - For point-to-point messaging
- **WebSocket Actions** - For real-time events
- **Event Actions** - For event processing
- **Context Actions** - For event context
- **Log Actions** - For event logging