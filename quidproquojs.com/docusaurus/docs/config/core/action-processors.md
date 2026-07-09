---
title: defineActionProcessors
description: Register a service's custom or overriding action processors — the runtime implementations that execute yielded actions.
---

# defineActionProcessors

Defines a source of **action processors** for a service. Stories yield actions; action processors are the runtime functions that actually execute them (talk to S3, DynamoDB, an API, etc.). `defineActionProcessors` points at a module that returns a map of processors, which the runtime merges into the service's processor list — the mechanism for **registering custom actions** or **overriding** the built-in processor for an existing action type. This is an advanced extension point; most services never need it.

- **On AWS:** no infrastructure of its own. The referenced module is bundled as a build source and loaded inside the service's existing Lambdas at runtime; there is no separate construct or resource.

```typescript
import { defineActionProcessors } from 'quidproquo-core';

export default [
  defineActionProcessors('/entry/actionProcessors/getCustomProcessors::getCustomProcessors'),
];
```

## Signature

```typescript
function defineActionProcessors(
  getActionProcessors: QpqFunctionRuntime,
): ActionProcessorsQPQConfigSetting;
```

## Parameters

### `getActionProcessors` — `QpqFunctionRuntime` (required)

A reference (usually a relative path string of the form `'/path/to/file::exportedFunctionName'`) to a module whose export is an `ActionProcessorListResolver` — an async function called with the resolved config and a dynamic module loader that returns an **action processor list**: a map from action type to its processor function.

```typescript
// getCustomProcessors.ts
import { ActionProcessorListResolver } from 'quidproquo-core';

export const getCustomProcessors: ActionProcessorListResolver = async (qpqConfig, dynamicModuleLoader) => ({
  ['MyDomain.DoThing']: async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    // execute the action and return its result
  },
});
```

Each key is an **action type**; each value is the processor that runs when a story yields an action of that type. Because the runtime merges all processor sources into a single map (later sources spread over earlier ones), a source that provides a key matching a built-in action type **overrides** the built-in processor, and a source that provides a new key **registers a custom action**. You can declare `defineActionProcessors` more than once — every declared source is loaded and merged. Each source's `uniqueKey` is derived from its runtime reference.

## Notes

- The resolver is invoked with the service's `QPQConfig` and a `dynamicModuleLoader`, so it can build processors that depend on config or lazily load further modules.
- A custom action typically pairs with a custom action **requester** (an `ask*` generator) that yields the matching action type, so stories can compose it like any built-in action.

## Examples

```typescript
import { defineActionProcessors } from 'quidproquo-core';

export default [
  // Register custom actions and/or override built-in processors
  defineActionProcessors('/entry/actionProcessors/getCustomProcessors::getCustomProcessors'),
];
```

## Related

- **AWS implementation:** no dedicated construct — the resolver module is bundled and loaded inside the service's Lambdas at runtime.
