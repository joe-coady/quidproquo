---
title: askClaudeAiMessagesApi
description: Call the Anthropic Claude Messages API directly from a story, passing a raw request body and API key.
---

# askClaudeAiMessagesApi

Calls the [Anthropic Claude Messages API](https://docs.anthropic.com/en/api/messages) directly and returns the raw `Anthropic.Message` response. This is a thin, low-level passthrough — you hand it the exact request body the Anthropic SDK expects and an API key, and get the SDK's response back untouched.

Prefer the provider-agnostic [askAiPrompt](../ai/ask-ai-prompt.md) / [askAiPromptStream](../ai/ask-ai-prompt-stream.md) actions for most work; reach for this when you need a Claude-specific feature exposed by the Messages API that the higher-level actions don't surface.

- **Action type:** `ClaudeAiActionType.MessagesApi`
- **On AWS:** invokes the Anthropic API over the network via the `@anthropic-ai/sdk` client, using the API key you pass.

```typescript
import { askClaudeAiMessagesApi, askConfigGetSecret } from 'quidproquo-core';

export function* askAskClaude(question: string) {
  const apiKey = yield* askConfigGetSecret('anthropic-api-key');

  const message = yield* askClaudeAiMessagesApi(
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: question }],
    },
    apiKey,
  );

  return message.content;
}
```

## Signature

```typescript
function* askClaudeAiMessagesApi(
  body: Anthropic.Messages.MessageCreateParamsNonStreaming,
  apiKey: string,
): AskResponse<Anthropic.Message>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `body` | `Anthropic.Messages.MessageCreateParamsNonStreaming` | The full Messages API request body — `model`, `max_tokens`, `messages`, and any other Claude parameters. This is the exact type from `@anthropic-ai/sdk`; only the non-streaming form is supported. |
| `apiKey` | `string` | Your Anthropic API key. Load it from a [secret](../../../config/core/secret.md) with `askConfigGetSecret` rather than hard-coding it. |

## Returns

`Anthropic.Message` — the raw response object from the Anthropic SDK, including `content`, `stop_reason`, `usage`, and the rest.

## Errors

| Error | Meaning |
| --- | --- |
| `ClaudeAiMessagesApiErrorTypeEnum.Unauthorized` | The API key is missing or invalid (HTTP 401). |
| `ClaudeAiMessagesApiErrorTypeEnum.PermissionDenied` | The API key lacks permission for this request (403). |
| `ClaudeAiMessagesApiErrorTypeEnum.InvalidRequest` | The request body was rejected as malformed or invalid (400 / 422). |
| `ClaudeAiMessagesApiErrorTypeEnum.RateLimited` | The Anthropic API is rate limiting; back off and retry later (429). |
| `ClaudeAiMessagesApiErrorTypeEnum.ServerError` | The Anthropic API returned a server error; a retry may succeed (5xx). |
| `ClaudeAiMessagesApiErrorTypeEnum.ConnectionError` | Could not reach the Anthropic API (network failure or timeout). |

Catch with `askCatch`, and pair `RateLimited` / `ServerError` / `ConnectionError` with [askRetry](../../../actions/core/system/ask-retry.md) since they are often transient.

## Related

- [askAiPrompt](../ai/ask-ai-prompt.md) / [askAiPromptStream](../ai/ask-ai-prompt-stream.md) — higher-level, provider-agnostic prompt actions; prefer these unless you need raw Messages API access.
- [askConfigGetSecret](../../../actions/core/config/ask-config-get-secret.md) — load the API key from a configured secret.
