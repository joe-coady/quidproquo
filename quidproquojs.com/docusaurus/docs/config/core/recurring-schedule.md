---
title: defineRecurringSchedule
description: Define a recurring schedule — a cron-driven trigger that runs a story on a timetable.
---

# defineRecurringSchedule

Defines a **recurring schedule**: a time-based trigger that runs a story on a cron timetable, with no incoming request. Use it for periodic work — nightly cleanups, polling, report generation, cache warming. Like a [queue](./queue.md) or [event bus](./event-bus.md), a schedule is an **event source**: each fire delivers a `ScheduledEvent` to the target story through the same [askProcessEvent](../../actions/core/event/ask-process-event.md) pipeline.

- **On AWS:** deploys an **EventBridge rule** with a cron schedule expression and a **consumer Lambda** as its target (`QpqCoreRecurringScheduleConstruct` in `quidproquo-deploy-awscdk`). The rule fires on the cron cadence and invokes the Lambda, passing the schedule's `metadata` as the event `detail`. The Lambda has a 15-minute timeout, and `maxConcurrentExecutions` (when set) becomes the Lambda's reserved concurrent executions.

```typescript
import { defineRecurringSchedule } from 'quidproquo-core';

export default [
  // Every day at 3 AM (server time)
  defineRecurringSchedule('0 0 3 * * ? *', '/entry/schedule/onNightlyCleanup::onNightlyCleanup'),
];
```

## Signature

```typescript
function defineRecurringSchedule(
  cronExpression: string,
  runtime: QpqFunctionRuntime,
  options?: QPQConfigAdvancedScheduleSettings,
): ScheduleQPQConfigSetting;
```

## Parameters

### `cronExpression` — `string` (required)

The cron expression that controls when the schedule fires. On AWS this is wrapped as `cron(<cronExpression>)` in the EventBridge rule, so it uses the six-field AWS EventBridge cron syntax:

```
minutes hours day-of-month month day-of-week year
```

| Field | Values | Wildcards |
| --- | --- | --- |
| Minutes | `0-59` | `,` `-` `*` `/` |
| Hours | `0-23` | `,` `-` `*` `/` |
| Day-of-month | `1-31` | `,` `-` `*` `?` `/` `L` `W` |
| Month | `1-12` or `JAN-DEC` | `,` `-` `*` `/` |
| Day-of-week | `1-7` or `SUN-SAT` | `,` `-` `*` `?` `L` `#` |
| Year | `1970-2199` | `,` `-` `*` `/` |

You cannot use `*` in both the day-of-month and day-of-week fields at once — put `?` in the one you don't want to constrain. Examples:

- `'* * * * ? *'` — every minute
- `'0/10 * * * ? *'` — every 10 minutes
- `'0 0 3 * * ? *'` — every day at 3 AM
- `'0 0 3 ? * 1 *'` — every Monday at 3 AM

### `runtime` — `QpqFunctionRuntime` (required)

The story to run each time the schedule fires. Usually a relative path string of the form `'/path/to/file::exportedFunctionName'`. This story's entry point is registered as a build source, and its `uniqueKey` (derived from the runtime) identifies the schedule.

### `options` — `QPQConfigAdvancedScheduleSettings` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `metadata` | `Record<string, any>` | `{}` | Arbitrary data attached to the schedule. On AWS it is passed through as the EventBridge target's `detail` and surfaces on the delivered event as `ScheduledEvent.metadata`. |
| `maxConcurrentExecutions` | `number` | – | Caps (and guarantees) the target Lambda's concurrent executions via reserved concurrency — never throttled below it, never scales above it. Carved out of the deploy account's shared concurrency pool. |
| `owner` | `CrossModuleOwner<'recurringSchedule'>` | – | Declares the schedule as owned by another module/service (cross-module resource naming). |
| `deprecated` | `boolean` | `false` | Marks the setting as deprecated in the config. |

## The delivered event: `ScheduledEvent`

Each fire delivers a `ScheduledEventParams` record to the target story:

```typescript
export interface ScheduledEventParams<T extends Record<string, any> = {}> {
  time: string;         // ISO time the schedule fired
  correlation: string;  // correlation id for this invocation
  metadata: T;          // the `metadata` you set on the schedule
}
```

- `time` — the event time reported by EventBridge.
- `correlation` — a correlation id for the invocation (the AWS request id on Lambda).
- `metadata` — the `metadata` object you passed to `defineRecurringSchedule`, typed by `T`.

```typescript
import { ScheduledEventParams } from 'quidproquo-core';

export function* onNightlyCleanup(event: ScheduledEventParams) {
  // event.time, event.correlation, event.metadata
  yield* askLogCreate(LogLevelEnum.Info, `cleanup fired at ${event.time}`);
}
```

## Examples

```typescript
import { defineRecurringSchedule } from 'quidproquo-core';

export default [
  // Poll an upstream every 10 minutes
  defineRecurringSchedule('0/10 * * * ? *', '/entry/schedule/onPoll::onPoll'),

  // Nightly report, capped to a single concurrent run, with metadata
  defineRecurringSchedule('0 0 2 * * ? *', '/entry/schedule/onNightlyReport::onNightlyReport', {
    maxConcurrentExecutions: 1,
    metadata: { report: 'daily-summary' },
  }),
];
```

## Related

- [askProcessEvent](../../actions/core/event/ask-process-event.md) — the pipeline that runs the target story for each schedule fire.
- [defineQueue](./queue.md) and [defineEventBus](./event-bus.md) — the other core event sources.
- [defineDeployEvent](./deploy-event.md) — a related time/lifecycle-based trigger that runs at deploy time rather than on a timetable.
- **AWS implementation:** `QpqCoreRecurringScheduleConstruct` (EventBridge rule + target Lambda) in `quidproquo-deploy-awscdk`.
