---
sidebar_position: 16
---

# Queue Actions

Send messages to queues for asynchronous processing and task distribution.

## Overview

Queue actions provide reliable message queuing for asynchronous processing, task distribution, and decoupling of components. Messages sent to queues are durably stored and processed by consumers, with automatic retry and dead-letter handling.

## Available Actions

### askQueueSendMessages

Send one or more messages to a queue.

#### Signature

```typescript
function* askQueueSendMessages<T extends QueueMessage<any>>(
  queueName: string,
  ...queueMessages: T[]
): QueueSendMessageActionRequester<T>
```

#### Parameters

```typescript
interface QueueMessage<T> {
  data: T;
  delaySeconds?: number;
  deduplicationId?: string;
  messageGroupId?: string;
}
```

- **queueName** (`string`): Name of the target queue
- **queueMessages** (`QueueMessage<T>[]`): Messages to send

#### Example

```typescript
import { askQueueSendMessages } from 'quidproquo-core';

// Send single message
function* sendEmailNotification(email: EmailData) {
  yield* askQueueSendMessages('email-queue', {
    data: {
      to: email.recipient,
      subject: email.subject,
      body: email.body,
      templateId: email.templateId
    }
  });
}

// Send multiple messages
function* processBatchOrders(orders: Order[]) {
  const messages = orders.map(order => ({
    data: {
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      total: order.total
    },
    messageGroupId: order.customerId // FIFO by customer
  }));
  
  yield* askQueueSendMessages('order-processing-queue', ...messages);
}

// Delayed message
function* scheduleReminder(reminder: Reminder) {
  yield* askQueueSendMessages('reminder-queue', {
    data: reminder,
    delaySeconds: 3600 // Send after 1 hour
  });
}
```

## Queue Patterns

### Task Distribution

```typescript
function* distributeWorkload(tasks: Task[]) {
  // Send tasks to queue for worker processing
  const messages = tasks.map(task => ({
    data: {
      taskId: task.id,
      type: task.type,
      payload: task.payload,
      priority: task.priority
    },
    deduplicationId: task.id // Prevent duplicates
  }));
  
  yield* askQueueSendMessages('task-queue', ...messages);
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Tasks distributed', {
    count: tasks.length,
    queueName: 'task-queue'
  });
}

// Worker consumer
function* processTask(message: QueueMessage<Task>) {
  const task = message.data;
  
  try {
    yield* askLogCreate(LogLevelEnum.INFO, 'Processing task', {
      taskId: task.taskId,
      type: task.type
    });
    
    const result = yield* executeTask(task);
    
    // Store result
    yield* askKeyValueStoreUpdate('tasks', task.taskId, {
      status: 'completed',
      result,
      completedAt: yield* askDateNow()
    });
    
  } catch (error) {
    // Failed tasks will be retried by queue
    yield* askLogCreate(LogLevelEnum.ERROR, 'Task failed', {
      taskId: task.taskId,
      error: error.message
    });
    
    throw error;
  }
}
```

### Email Queue

```typescript
interface EmailMessage {
  to: string | string[];
  subject: string;
  body?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

function* queueEmail(email: EmailMessage) {
  // Validate email
  if (!email.to || (!email.body && !email.templateId)) {
    yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      'Email must have recipient and content'
    );
  }
  
  yield* askQueueSendMessages('email-queue', {
    data: {
      ...email,
      queuedAt: yield* askDateNow(),
      correlationId: yield* askContextRead(correlationIdContext)
    }
  });
  
  yield* askLogCreate(LogLevelEnum.INFO, 'Email queued', {
    to: email.to,
    subject: email.subject
  });
}

function* sendBulkEmails(recipients: string[], template: string) {
  // Batch emails to avoid overwhelming the queue
  const batchSize = 100;
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const messages = batch.map(recipient => ({
      data: {
        to: recipient,
        templateId: template,
        templateData: { recipient }
      }
    }));
    
    yield* askQueueSendMessages('email-queue', ...messages);
    
    // Rate limit batches
    if (i + batchSize < recipients.length) {
      yield* askDelay(1000);
    }
  }
}
```

### Image Processing

```typescript
function* queueImageProcessing(imageUrl: string, operations: ImageOperation[]) {
  const jobId = yield* askNewGuid();
  
  // Queue processing job
  yield* askQueueSendMessages('image-processing-queue', {
    data: {
      jobId,
      imageUrl,
      operations,
      requestedAt: yield* askDateNow()
    }
  });
  
  // Store job status
  yield* askKeyValueStoreUpsert('image-jobs', {
    id: jobId,
    status: 'queued',
    imageUrl,
    operations
  });
  
  return jobId;
}

function* processImageJob(message: QueueMessage<ImageJob>) {
  const job = message.data;
  
  try {
    // Update status
    yield* askKeyValueStoreUpdate('image-jobs', job.jobId, {
      status: 'processing',
      startedAt: yield* askDateNow()
    });
    
    // Download image
    const imageData = yield* askNetworkRequest('GET', job.imageUrl, {
      responseType: 'arraybuffer'
    });
    
    // Apply operations
    let processedImage = imageData;
    for (const operation of job.operations) {
      processedImage = yield* applyImageOperation(processedImage, operation);
    }
    
    // Store result
    const resultUrl = yield* uploadProcessedImage(job.jobId, processedImage);
    
    yield* askKeyValueStoreUpdate('image-jobs', job.jobId, {
      status: 'completed',
      resultUrl,
      completedAt: yield* askDateNow()
    });
    
  } catch (error) {
    yield* askKeyValueStoreUpdate('image-jobs', job.jobId, {
      status: 'failed',
      error: error.message,
      failedAt: yield* askDateNow()
    });
    
    throw error;
  }
}
```

### Workflow Orchestration

```typescript
function* queueWorkflowStep(
  workflowId: string,
  stepName: string,
  inputData: any
) {
  yield* askQueueSendMessages('workflow-queue', {
    data: {
      workflowId,
      stepName,
      inputData,
      timestamp: yield* askDateNow()
    },
    messageGroupId: workflowId // Ensure order within workflow
  });
}

function* orchestrateOrderWorkflow(order: Order) {
  const workflowId = yield* askNewGuid();
  
  // Queue workflow steps
  yield* queueWorkflowStep(workflowId, 'validate', order);
  yield* queueWorkflowStep(workflowId, 'payment', {
    amount: order.total,
    customerId: order.customerId
  });
  yield* queueWorkflowStep(workflowId, 'inventory', {
    items: order.items
  });
  yield* queueWorkflowStep(workflowId, 'shipping', {
    address: order.shippingAddress
  });
  yield* queueWorkflowStep(workflowId, 'notification', {
    email: order.customerEmail
  });
  
  return workflowId;
}
```

### Dead Letter Queue

```typescript
function* handleDeadLetterMessage(message: QueueMessage<any>) {
  const dlqEntry = {
    id: yield* askNewGuid(),
    originalMessage: message,
    receivedAt: yield* askDateNow(),
    source: 'main-queue'
  };
  
  // Store for analysis
  yield* askKeyValueStoreUpsert('dead-letters', dlqEntry);
  
  // Alert operations team
  yield* askEventBusSendMessage('alerts', {
    type: 'DEAD_LETTER_MESSAGE',
    data: {
      messageId: dlqEntry.id,
      messageType: message.data?.type,
      timestamp: dlqEntry.receivedAt
    }
  });
  
  // Attempt to process with fallback logic
  try {
    yield* processFallback(message);
  } catch (error) {
    yield* askLogCreate(LogLevelEnum.ERROR, 'DLQ processing failed', {
      messageId: dlqEntry.id,
      error: error.message
    });
  }
}
```

### Priority Queue

```typescript
interface PriorityMessage<T> {
  priority: 'high' | 'normal' | 'low';
  data: T;
}

function* sendPriorityMessage<T>(
  queueName: string,
  message: PriorityMessage<T>
) {
  const delayMap = {
    high: 0,
    normal: 10,
    low: 60
  };
  
  yield* askQueueSendMessages(queueName, {
    data: message.data,
    delaySeconds: delayMap[message.priority]
  });
}
```

### Batch Processing

```typescript
function* queueBatchJob(items: any[], batchSize: number = 100) {
  const batches = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  const messages = batches.map((batch, index) => ({
    data: {
      batchId: yield* askNewGuid(),
      batchNumber: index + 1,
      totalBatches: batches.length,
      items: batch
    }
  }));
  
  yield* askQueueSendMessages('batch-processing-queue', ...messages);
  
  return messages.map(m => m.data.batchId);
}
```

## Testing

```typescript
describe('Queue Actions', () => {
  test('sends messages to queue', () => {
    function* sendMessage() {
      yield* askQueueSendMessages('test-queue', 
        { data: { id: 1 } },
        { data: { id: 2 } }
      );
    }
    
    const story = sendMessage();
    
    // First yield: get context
    const { value: contextAction } = story.next();
    expect(contextAction.type).toBe('Context::List');
    
    // Second yield: send messages
    story.next({});
    const { value: queueAction } = story.next();
    
    expect(queueAction.type).toBe('Queue::SendMessages');
    expect(queueAction.payload.queueName).toBe('test-queue');
    expect(queueAction.payload.queueMessages).toHaveLength(2);
  });
});
```

## Best Practices

### 1. Include Message Metadata

```typescript
// Good - includes metadata
yield* askQueueSendMessages('queue', {
  data: payload,
  metadata: {
    version: '1.0',
    timestamp: yield* askDateNow(),
    correlationId: yield* askContextRead(correlationIdContext)
  }
});
```

### 2. Use Deduplication IDs

```typescript
// Good - prevents duplicate processing
yield* askQueueSendMessages('queue', {
  data: order,
  deduplicationId: order.id
});
```

### 3. Handle Failures Gracefully

```typescript
function* processQueueMessage(message: any) {
  try {
    return yield* processMessage(message);
  } catch (error) {
    if (isRetryable(error)) {
      throw error; // Let queue retry
    }
    // Send to DLQ for non-retryable errors
    yield* askQueueSendMessages('dlq', { data: message });
  }
}
```

## Related Actions

- **EventBus Actions** - For pub/sub messaging
- **Context Actions** - For message context
- **Log Actions** - For queue logging
- **Platform Actions** - For delayed messages