---
name: feedback_web_concerns_off_core_config
description: Platform-specific concerns (web CORS/domains, AWS-only capabilities) must not be fields on core config settings; model them as a setting in the owning layer (webserver / config-aws) keyed by the core resource name
metadata:
  type: feedback
---

Platform-specific concerns must not leak onto core (`quidproquo-core`) config settings, even when they configure a core resource. The tell: would this field make sense if the resource ran on a non-AWS / non-browser runtime? If no, it's not a core concern. Applied twice so far:

- **Web/browser concern** → `quidproquo-webserver`. Bucket CORS `allowedOrigins` is a browser thing, so NOT on `defineStorageDrive` — it's `defineStorageDriveCorsSettings(storageDriveName, allowedOrigins)`.
- **AWS-only capability** → `quidproquo-config-aws`. Direct SNS email/webhook fan-out (no compute) is an SNS feature, not a portable event-bus concept, so NOT on `defineEventBus` — it's `defineEventBusQuickSubscription(eventBusName, EventBusSubscription[])` (`QPQAwsConfigSettingType.awsEventBusQuickSubscription`), resolved by `qpqConfigAwsUtils.getEventBusQuickSubscriptions(qpqConfig, busName)`.

The pattern each time:
1. Add a setting in the **owning layer** keyed by the core resource's name (`uniqueKey: <resourceName>`).
2. Put resolution in that layer's util (look up by name; else a sensible default; else fall back).
3. The **core CDK construct** stays platform-agnostic: it takes a resolved primitive prop (e.g. `corsAllowedOrigins?: string[]`), never imports the upper layer — OR the construct itself (already in the deploy package, which depends on all layers) calls the resolver by resource name, as `QpqCoreEventBusConstruct` does.
4. The **deploy layer** is the one place allowed to see all worlds.

**Why:** core must run headless (no deployed cloud resource) — e.g. a local-only app/game using local JS action processors. Pushing the decision *up* to the owning/deploy layer (not *down* into core) preserves that.

**How to apply:** when tempted to add a platform-flavoured field to a core `define*`, stop — make a setting in the owning layer keyed by the core resource name, resolve at deploy. For domain-derived defaults, detect "no domain configured" via `getDomainName(qpqConfig) === ''`, NOT `getBaseDomainName` (which still returns an env prefix like `development.`). Relates to [[project_define_vs_create_naming]] and [[feedback_derived_resource_names]].
