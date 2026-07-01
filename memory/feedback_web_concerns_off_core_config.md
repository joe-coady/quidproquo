---
name: feedback_web_concerns_off_core_config
description: Web-only concerns (CORS, domains, origins) must not be fields on core config settings; model them as a webserver config setting keyed by the core resource name
metadata:
  type: feedback
---

Web-layer concerns must not leak onto core (`quidproquo-core`) config settings, even when they configure a core resource. Example: bucket CORS `allowedOrigins` belongs to the browser/web world, so it does NOT go on `defineStorageDrive` (core). Instead:

1. Add a **webserver** config setting keyed by the core resource's name — e.g. `defineStorageDriveCorsSettings(storageDriveName, allowedOrigins)` (new `QPQWebServerConfigSettingType`).
2. Put the resolution logic in a webserver util (e.g. `qpqWebServerUtils.getStorageDriveCorsAllowedOrigins(qpqConfig, storageDriveName)`) that looks up the setting by name, else derives a sensible default (service domain), else falls back.
3. The **core CDK construct** stays domain-agnostic: it accepts a resolved primitive prop (e.g. `corsAllowedOrigins?: string[]`, default `['*']`) — it never imports webserver.
4. The **deploy layer** (`InfQpqServiceStack`) is the one place allowed to see both worlds: it calls the webserver resolver and injects the resolved prop into the core construct.

**Why:** core must run headless (no deployed cloud resource) — e.g. a local-only app/game using local JS action processors. Keeping web concepts out of core preserves that. Pushing the decision *up* to the web/deploy layer (not *down* into core) is the correct direction.

**How to apply:** when tempted to add a web-flavoured field to a core `define*`, stop — make a webserver setting keyed by the core resource name and resolve+inject at the deploy stack. Detect "no domain configured" via `getDomainName(qpqConfig) === ''`, NOT `getBaseDomainName` (which still returns an env prefix like `development.`). Relates to [[project_define_vs_create_naming]] and [[feedback_derived_resource_names]].
