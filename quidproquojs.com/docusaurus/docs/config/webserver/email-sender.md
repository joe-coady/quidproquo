---
title: defineEmailSender
description: Declare a domain a service is allowed to send email from.
---

# defineEmailSender

Declares a domain the service can send email from with [askEmailSendEmail](../../actions/webserver/email/ask-email-send-email.md). The domain must live under a base declared with [defineDns](./dns.md) — deploy resolves it the same way (environment/feature prefixed) before creating the sending identity.

- **On AWS:** creates an SES `EmailIdentity` for the resolved domain in its Route53 hosted zone (DKIM records land there automatically), and scopes the service role's `ses:SendEmail` / `ses:SendRawEmail` grant to that identity's exact ARN. `ses:SendRawEmail` is needed for emails with attachments, which are sent as raw MIME. No grant or identity is created for services that declare no `defineEmailSender`.

```typescript
import { defineDns, defineEmailSender } from 'quidproquo-webserver';

export default [
  defineDns('example.com'),
  defineEmailSender('example.com'),
];
```

## Signature

```typescript
function defineEmailSender(
  rootDomain: string,
): EmailSenderQPQWebServerConfigSetting;
```

## Parameters

### `rootDomain` — `string` (required)

The domain to send from, resolved the same way as [defineDns](./dns.md)'s `dnsBase` (environment/feature prefixed). This value is also the config's `uniqueKey`, so a service declares one sender per root domain.

## Returns

An `EmailSenderQPQWebServerConfigSetting` config entry. Deploy reads every declared entry with `qpqWebServerUtils.getEmailSenderSettings` to create the SES identities and IAM grants.

## Related

- [askEmailSendEmail](../../actions/webserver/email/ask-email-send-email.md) — send email from a domain declared here.
- [defineDns](./dns.md) — the base domain this sender's `rootDomain` resolves against.
- [defineEmailSenderAllowList](../config-aws/email-sender-allow-list.md) — recipient addresses allowed while the SES account is in sandbox mode.
