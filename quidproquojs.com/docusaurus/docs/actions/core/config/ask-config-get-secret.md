---
title: askConfigGetSecret
description: Read the value of a configured secret at runtime.
---

# askConfigGetSecret

Reads the current value of a [secret](../../../config/core/secret.md) by name and returns it as a string. Use this for credentials, API keys, and other sensitive values that must not live in source or plain config.

- **Action type:** `ConfigActionType.GetSecret`
- **On AWS:** fetches the value from AWS Secrets Manager (`secretsmanager:GetSecretValue`). The secret itself is provisioned by [defineSecret](../../../config/core/secret.md).

```typescript
import { askConfigGetSecret, askClaudeAiMessagesApi } from 'quidproquo-core';

export function* askCallExternalApi(prompt: string) {
  const apiKey = yield* askConfigGetSecret('anthropic-api-key');

  return yield* askClaudeAiMessagesApi(
    { model: 'claude-sonnet-4-6', max_tokens: 512, messages: [{ role: 'user', content: prompt }] },
    apiKey,
  );
}
```

## Signature

```typescript
function* askConfigGetSecret(
  secretName: string,
): AskResponse<string>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `secretName` | `string` | Name of the secret — must match a secret declared with [defineSecret](../../../config/core/secret.md) (or one shared via its `owner` option). |

## Returns

`string` — the secret's current value.

## Errors

| Error | Meaning |
| --- | --- |
| `ConfigGetSecretErrorTypeEnum.ResourceNotFound` | No secret with that name exists. |
| `ConfigGetSecretErrorTypeEnum.Throttling` | The request rate exceeded the provider's limit; back off and retry. |

## Related

- [defineSecret](../../../config/core/secret.md) — declares the secret this action reads.
- [askConfigGetParameter](./ask-config-get-parameter.md) — the equivalent for non-secret configuration values.
