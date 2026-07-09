---
title: defineClaudeAI
description: Define a named Claude AI configuration with a preferred model size.
---

# defineClaudeAI

Declares a named **Claude AI config** carrying a preferred model size. It is a lightweight, Claude-specific config; most applications reach for [defineAi](./ai.md) (with the provider-agnostic [askAiPrompt](../../actions/core/ai/ask-ai-prompt.md) actions) or call the [Messages API directly](../../actions/core/claude-ai/ask-claude-ai-messages-api.md) with an explicit API key instead.

```typescript
import { defineClaudeAI, ClaudeAIModelSize } from 'quidproquo-core';

export default [
  defineClaudeAI('assistant', {
    modelSize: ClaudeAIModelSize.Large,
  }),
];
```

## Signature

```typescript
function defineClaudeAI(
  name: string,
  options?: QPQConfigAdvancedClaudeAISettings,
): ClaudeAIQPQConfigSetting;
```

## Parameters

### `name` — `string` (required)

The name of the config, and its `uniqueKey` within the config.

### `options` — `QPQConfigAdvancedClaudeAISettings` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `modelSize` | [`ClaudeAIModelSize`](#claudeaimodelsize) | `ClaudeAIModelSize.Medium` | The preferred model tier for this config. |

### `ClaudeAIModelSize`

| Member | Value |
| --- | --- |
| `Small` | `'small'` |
| `Medium` | `'medium'` (default) |
| `Large` | `'large'` |

## Related

- [defineAi](./ai.md) — the general AI config with tool definitions, used by the provider-agnostic prompt actions.
- [askClaudeAiMessagesApi](../../actions/core/claude-ai/ask-claude-ai-messages-api.md) — call the Anthropic Messages API directly.
