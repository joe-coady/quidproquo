---
title: defineEmailSenderAllowList
description: Recipient addresses a service is allowed to email while its SES account is in sandbox mode.
---

# defineEmailSenderAllowList

Declares recipient addresses a service is allowed to send to while its SES account is still in **sandbox mode**. In sandbox, SES authorizes a send against the recipient's identity as well as the sender's, so [defineEmailSender](../webserver/email-sender.md)'s exact-ARN send grant needs each recipient identity listed too. The addresses must also be verified identities in the SES console (sandbox requires that anyway).

This is an AWS-specific concession, not a portable email concept, which is why it lives in `quidproquo-config-aws` keyed by the same `rootDomain` as `defineEmailSender` rather than on that webserver setting directly. Once the account has SES production access this setting does nothing useful and can be deleted.

```typescript
import { defineEmailSender } from 'quidproquo-webserver';
import { defineEmailSenderAllowList } from 'quidproquo-config-aws';

export default [
  defineEmailSender('example.com'),

  defineEmailSenderAllowList('example.com', ['joe@external.com', 'test@external.com']),
];
```

## Signature

```typescript
function defineEmailSenderAllowList(
  rootDomain: string,
  allowedEmailAddresses: string[],
): EmailSenderAllowListQPQConfigSetting;
```

## Parameters

### `rootDomain` — `string` (required)

The `rootDomain` of the matching [defineEmailSender](../webserver/email-sender.md) this allow-list applies to.

### `allowedEmailAddresses` — `string[]` (required)

Recipient addresses to grant sandbox send access to. Multiple calls for the same `rootDomain` are additive.

## Related

- [defineEmailSender](../webserver/email-sender.md) — the sending domain this allow-list is keyed by.
- [askEmailSendEmail](../../actions/webserver/email/ask-email-send-email.md) — the action these addresses need to be reachable from.
