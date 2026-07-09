---
sidebar_position: 6
---

# Date Actions

Work with dates and times in a platform-consistent way across all environments.

## Overview

Date actions provide a standardized way to work with dates and times across different platforms. They ensure consistent timestamp formats, timezone handling, and date manipulation regardless of whether your code runs in AWS Lambda, Node.js, or the browser.

## Available Actions

### askDateNow

Get the current date and time as an ISO 8601 string.

#### Signature

```typescript
function* askDateNow(): Generator<DateNowAction, string, any>
```

#### Returns

Returns the current date/time as an ISO 8601 string (e.g., "2024-01-15T10:30:00.000Z").

#### Example

```typescript
import { askDateNow } from 'quidproquo-core';

function* createTimestampedRecord(data: any) {
  const now = yield* askDateNow();
  
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  };
}

function* logWithTimestamp(message: string) {
  const timestamp = yield* askDateNow();
  yield* askLogCreate('INFO', `[${timestamp}] ${message}`);
}
```

## Date Utility Stories

Quidproquo provides utility stories for common date operations:

### Date Manipulation

```typescript
import {
  addDaysToTDateIso,
  addMonthsToTDateIso,
  addYearsToTDateIso,
  addMillisecondsToTDateIso
} from 'quidproquo-core/stories';

function* calculateDueDate() {
  const now = yield* askDateNow();
  
  // Add 30 days
  const dueIn30Days = addDaysToTDateIso(now, 30);
  
  // Add 3 months
  const dueIn3Months = addMonthsToTDateIso(now, 3);
  
  // Add 1 year
  const dueNextYear = addYearsToTDateIso(now, 1);
  
  // Add 5 hours (in milliseconds)
  const in5Hours = addMillisecondsToTDateIso(now, 5 * 60 * 60 * 1000);
  
  return {
    now,
    dueIn30Days,
    dueIn3Months,
    dueNextYear,
    in5Hours
  };
}
```

### Epoch Time Operations

```typescript
import {
  askGetCurrentEpoch,
  askGetEpochStartTime,
  askSecondsElapsedFrom
} from 'quidproquo-core/stories';

function* measureExecutionTime() {
  const startTime = yield* askDateNow();
  
  // Perform operations
  yield* someExpensiveOperation();
  
  // Calculate elapsed time
  const elapsedSeconds = yield* askSecondsElapsedFrom(startTime);
  
  yield* askLogCreate('PERF', `Operation took ${elapsedSeconds} seconds`);
  
  return elapsedSeconds;
}

function* getTimestamps() {
  // Get current epoch (milliseconds since 1970-01-01)
  const epochMs = yield* askGetCurrentEpoch();
  
  // Get epoch start time as ISO string
  const epochStart = yield* askGetEpochStartTime();
  
  return {
    epochMs,        // e.g., 1705316400000
    epochStart,     // "1970-01-01T00:00:00.000Z"
    epochSeconds: Math.floor(epochMs / 1000)
  };
}
```

## Common Patterns

### Timestamp Management

```typescript
function* createAuditLog(action: string, entityId: string) {
  const timestamp = yield* askDateNow();
  
  yield* askKeyValueStoreUpsert('audit-logs', {
    id: yield* askGuidNew(),
    action,
    entityId,
    timestamp,
    user: yield* askContextRead(userContext),
    epochMs: Date.parse(timestamp)
  });
}
```

### Expiration Handling

```typescript
function* createTemporaryToken(userId: string, hoursValid: number = 24) {
  const now = yield* askDateNow();
  const expiresAt = addMillisecondsToTDateIso(now, hoursValid * 60 * 60 * 1000);
  
  const token = {
    id: yield* askGuidNew(),
    userId,
    createdAt: now,
    expiresAt,
    token: yield* askGenerateSecureToken()
  };
  
  yield* askKeyValueStoreUpsert('tokens', token);
  
  return token;
}

function* validateToken(tokenId: string) {
  const token = yield* askKeyValueStoreGet<any>('tokens', tokenId);
  
  if (!token) {
    yield* askThrowError('INVALID_TOKEN', 'Token not found');
  }
  
  const now = yield* askDateNow();
  
  if (token.expiresAt < now) {
    yield* askKeyValueStoreDelete('tokens', tokenId);
    yield* askThrowError('TOKEN_EXPIRED', 'Token has expired');
  }
  
  return token;
}
```

### Date Ranges

```typescript
function* getRecordsInRange(startDate: string, endDate: string) {
  const records = yield* askKeyValueStoreQuery('records', {
    filterCondition: {
      operation: 'AND',
      conditions: [
        {
          key: 'createdAt',
          operation: '>=',
          valueA: startDate
        },
        {
          key: 'createdAt',
          operation: '<=',
          valueA: endDate
        }
      ]
    }
  });
  
  return records.items;
}

function* getLastWeekRecords() {
  const now = yield* askDateNow();
  const weekAgo = addDaysToTDateIso(now, -7);
  
  return yield* getRecordsInRange(weekAgo, now);
}
```

### Scheduling

```typescript
function* scheduleTask(taskData: any, scheduledFor: string) {
  const now = yield* askDateNow();
  
  if (scheduledFor <= now) {
    // Execute immediately
    return yield* executeTask(taskData);
  }
  
  // Schedule for later
  yield* askKeyValueStoreUpsert('scheduled-tasks', {
    id: yield* askGuidNew(),
    taskData,
    scheduledFor,
    createdAt: now,
    status: 'pending'
  });
  
  // Calculate delay
  const delayMs = Date.parse(scheduledFor) - Date.parse(now);
  
  // Queue with delay
  yield* askQueueSendMessage('task-queue', taskData, { delayMs });
}
```

### Business Hours

```typescript
function* isBusinessHours(timezone: string = 'UTC') {
  const now = yield* askDateNow();
  const date = new Date(now);
  
  // Convert to timezone (simplified - use proper library in production)
  const hours = date.getUTCHours();
  const dayOfWeek = date.getUTCDay();
  
  // Monday-Friday, 9 AM - 5 PM
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isBusinessHour = hours >= 9 && hours < 17;
  
  return isWeekday && isBusinessHour;
}

function* handleRequest(request: any) {
  if (!(yield* isBusinessHours())) {
    return {
      statusCode: 503,
      body: 'Service available during business hours only'
    };
  }
  
  return yield* processRequest(request);
}
```

### Age Calculation

```typescript
function* calculateAge(birthDateIso: string) {
  const now = yield* askDateNow();
  
  const birthDate = new Date(birthDateIso);
  const currentDate = new Date(now);
  
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function* verifyAge(userId: string, requiredAge: number = 18) {
  const user = yield* askKeyValueStoreGet<any>('users', userId);
  const age = yield* calculateAge(user.birthDate);
  
  if (age < requiredAge) {
    yield* askThrowError('AGE_RESTRICTION', `Must be ${requiredAge} or older`);
  }
  
  return age;
}
```

## Time Zones

While `askDateNow` always returns UTC time, you can work with time zones:

```typescript
function* getLocalTime(timezone: string) {
  const utcTime = yield* askDateNow();
  
  // Use Intl.DateTimeFormat for timezone conversion
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  return formatter.format(new Date(utcTime));
}

function* scheduleInUserTimezone(userId: string, localTime: string) {
  const user = yield* askKeyValueStoreGet<any>('users', userId);
  const timezone = user.timezone || 'America/New_York';
  
  // Convert local time to UTC
  const utcTime = convertToUTC(localTime, timezone);
  
  yield* scheduleTask({
    userId,
    scheduledFor: utcTime
  });
}
```

## Formatting

```typescript
function* formatDate(isoString: string, format: string = 'short') {
  const date = new Date(isoString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'time':
      return date.toLocaleTimeString();
    
    case 'relative':
      return yield* getRelativeTime(isoString);
    
    default:
      return isoString;
  }
}

function* getRelativeTime(pastTime: string) {
  const now = yield* askDateNow();
  const diffMs = Date.parse(now) - Date.parse(pastTime);
  const diffSeconds = Math.floor(diffMs / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}
```

## Performance Tracking

```typescript
function* trackPerformance<T>(
  operation: () => Generator<any, T, any>,
  operationName: string
) {
  const startTime = yield* askDateNow();
  const startEpoch = Date.parse(startTime);
  
  try {
    const result = yield* operation();
    
    const endTime = yield* askDateNow();
    const durationMs = Date.parse(endTime) - startEpoch;
    
    yield* askEventBusSendMessage('performance-metrics', {
      operation: operationName,
      startTime,
      endTime,
      durationMs,
      success: true
    });
    
    return result;
  } catch (error) {
    const endTime = yield* askDateNow();
    const durationMs = Date.parse(endTime) - startEpoch;
    
    yield* askEventBusSendMessage('performance-metrics', {
      operation: operationName,
      startTime,
      endTime,
      durationMs,
      success: false,
      error: error.message
    });
    
    throw error;
  }
}
```

## Testing

```typescript
describe('Date Operations', () => {
  test('creates timestamp', () => {
    function* createRecord() {
      const timestamp = yield* askDateNow();
      return { createdAt: timestamp };
    }
    
    const story = createRecord();
    
    // First yield: get current time
    const { value: dateAction } = story.next();
    expect(dateAction.type).toBe('Date::Now');
    
    // Provide mock time
    const mockTime = '2024-01-15T10:00:00.000Z';
    const { value: result } = story.next(mockTime);
    
    expect(result.createdAt).toBe(mockTime);
  });
  
  test('date arithmetic', () => {
    const baseDate = '2024-01-15T00:00:00.000Z';
    
    expect(addDaysToTDateIso(baseDate, 10))
      .toBe('2024-01-25T00:00:00.000Z');
    
    expect(addMonthsToTDateIso(baseDate, 2))
      .toBe('2024-03-15T00:00:00.000Z');
    
    expect(addYearsToTDateIso(baseDate, 1))
      .toBe('2025-01-15T00:00:00.000Z');
  });
});
```

## Best Practices

### 1. Always Use ISO 8601

```typescript
// Good - ISO 8601 format
const timestamp = yield* askDateNow(); // "2024-01-15T10:30:00.000Z"

// Bad - custom formats
const badTime = new Date().toLocaleString(); // Don't use
```

### 2. Store UTC, Display Local

```typescript
function* saveEvent(eventData: any) {
  // Always store in UTC
  const utcTime = yield* askDateNow();
  
  yield* askKeyValueStoreUpsert('events', {
    ...eventData,
    createdAt: utcTime
  });
}

function* displayEvent(eventId: string, userTimezone: string) {
  const event = yield* askKeyValueStoreGet('events', eventId);
  
  // Convert to user's timezone for display
  const localTime = convertToTimezone(event.createdAt, userTimezone);
  
  return {
    ...event,
    displayTime: localTime
  };
}
```

### 3. Use Epoch for Calculations

```typescript
function* calculateDuration(startIso: string, endIso: string) {
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);
  
  const durationMs = endMs - startMs;
  
  return {
    milliseconds: durationMs,
    seconds: durationMs / 1000,
    minutes: durationMs / 60000,
    hours: durationMs / 3600000,
    days: durationMs / 86400000
  };
}
```

## Related Actions

- **Platform Actions** - For delays and timing
- **Log Actions** - For timestamped logging
- **KeyValueStore Actions** - For storing timestamped data
- **Queue Actions** - For delayed message processing