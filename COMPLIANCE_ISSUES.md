# Compliance / Security Issues

Source: "Security/compliance issue findings (From Claude)" — originally reviewed against `new-auth-oauth`.
Re-verified against the current branch. Open items are listed first (ordered easiest → hardest by rough implementation effort); fixed items (checked) are moved to the bottom.

Legend: `[ ]` = still open, `[x]` = fixed. Items tagged **PARTIAL** have had progress but are not fully resolved, so they remain open. Each open item has an `(effort: …)` estimate.

---

## Open — easiest first

[ ] 6.4 CloudFront S3 policy allows any distribution in the account — **PARTIAL**; web-entry bucket now scoped to its exact distribution, storage-drive bucket constrained by cross-stack boundary. `(effort: easy)`
`WebQpqWebserverWebEntryConstruct.ts` no longer adds a manual `distribution/*` statement for the bucket it owns: `S3BucketOrigin.withOriginAccessControl` (CDK) auto-adds a policy scoped to that exact distribution's ARN (`StringEquals` on `AWS:SourceArn`), so the redundant broader statement was removed. `QpqCoreStorageDriveConstruct.ts` still uses account-scoped `distribution/*` because its bucket is consumed by a distribution in a *separate* service/deploy phase (imported by name → CDK can't auto-scope it, and the consuming distribution's AWS-generated ID isn't knowable here and can't be cross-referenced per the separate-deploys rule). Account-scoped `distribution/*` is the pragmatic ceiling for that path.

[ ] 12.2 No AWS Shield Advanced — only default Shield Standard. `(effort: easy)`
Mostly a cost/decision item: evaluate and optionally enable Shield Advanced for production workloads with SLA requirements. Minimal code.

[ ] 11.2 No reserved capacity or savings plans — opt-in only. `(effort: easy)`
Reserved concurrency is passthrough (undefined by default). Add sensible defaults for critical functions and document a Savings Plans / Reserved Capacity strategy.

[ ] 13.4 No CloudWatch dashboards — none defined. `(effort: medium)`
Add a default operational dashboard per service (request rate, error rate, latency p50/p95/p99, Lambda duration, concurrent executions, DynamoDB capacity, queue depth).

[ ] 13.5 No anomaly detection — **PARTIAL**; cost anomaly detection done (via 11.1), CloudWatch metric anomaly detection still open. `(effort: medium)`
Cost creep is now surfaced by Cost Anomaly Detection (see 11.1). Still to do: CloudWatch `AnomalyDetector` on critical operational metrics (Lambda duration, API latency, error rates) so performance degradation and slow leaks get surfaced.

[ ] 6.1 No Lambda code signing — no `CodeSigningConfig` / `SigningProfile`. `(effort: medium)`
Create an `aws_signer.SigningProfile` and `aws_lambda.CodeSigningConfig` and attach to all Lambda functions so uploaded code has integrity verification.

[ ] 5.2 Minimal VPC configuration, no flow logs — VPC sets only `maxAzs` and `vpcName`. `(effort: medium)`
Add VPC flow logs (CloudWatch/S3), VPC endpoints (S3/DynamoDB/Secrets Manager), and NAT configuration to the bootstrap VPC construct.

[ ] 5.1 No security groups defined — zero `SecurityGroup` constructs. `(effort: medium-hard)`
Lambdas in VPCs use the default security group. Create explicit security groups with minimal ingress/egress rules per service, exposed through config.

[ ] 14.2 No AWS security services integration — zero coverage. `(effort: medium-hard)`
Enable GuardDuty and SecurityHub (account-level), add AWS Config rules for critical resources, and consider Inspector (Lambda vuln scanning) and Macie (S3 PII discovery).

[ ] 13.6 No custom application metrics — no EMF/PutMetricData. `(effort: medium-hard)`
No business-transaction metrics or latency percentiles beyond CloudWatch defaults. Add embedded-metrics-format (EMF) logging for custom application metrics.

[ ] 4.3 No KMS key constructs anywhere — **PARTIAL**; keys consumed by ARN, none provisioned. `(effort: hard)`
S3/DynamoDB accept a KMS key via `fromKeyArn` but no `new aws_kms.Key(...)` is created. Add a shared KMS key construct with key policies + rotation and wire it into S3, DynamoDB, Secrets Manager, and logs.

[ ] 13.2 No security event monitoring — no auth-failure/brute-force alerting. `(effort: hard)`
Add CloudWatch metric filters for auth failures, alarms for abnormal 401/403 rates, Cognito failed-login/brute-force detection, and credential-stuffing signals.

[ ] 12.1 No WAF on CloudFront or API Gateway — zero coverage. `(effort: hard)`
Create an `aws_wafv2.CfnWebACL` with AWS Managed Rules (Common, KnownBadInputs, SQLi, BotControl), add rate-based rules for auth endpoints, and associate with CloudFront + API Gateway. Currently all malicious traffic reaches Lambda.

[ ] 14.1 No real-time log streaming — zero coverage. `(effort: hard)`
Add CloudWatch Logs subscription filters → Kinesis Firehose (S3 archival + SIEM endpoint), or a Lambda log forwarder (Datadog/Splunk/Elastic). Current S3 JSON logs are forensic, not real-time.

[ ] 14.3 Log format not SIEM-optimized — unstructured CloudWatch logs. `(effort: hard)`
Operational/error logging uses raw `console.log`/`console.error` with no consistent schema. Adopt structured JSON logging (CEF/OCSF/ECS-style) with enforced fields (timestamp, level, service, correlationId, userId, action, outcome) across all handlers.

[ ] 7.2 No input validation framework — bodies/params passed through unvalidated. `(effort: hard)`
`HTTPEvent.ts` exposes `body` as a raw string parsed with `JSON.parse()`, no schema validation, and `zod` isn't a dependency. Add a schema-validation layer at API boundaries — a cross-cutting framework change.

---

## Fixed

[x] 1.1 Wildcard IAM permissions on shared service role — all four remaining control-plane wildcards scoped.
All in `WebserverRoll.ts` (the per-service `service-role`), scoped to what the runtime actually calls (each verified to a single call site). (1) `sns:Publish` → exact topic ARNs for every event bus the service declares (owned + referenced cross-module), derived at synth with `awsNamingUtils.getEventBusSnsTopicArn` using the same owner-fallback mapping as the runtime send processor; the statement is omitted entirely when a service declares no event buses (nothing to publish to — the lambda-warmer topic is published by EventBridge, not this role). (2) `execute-api:ManageConnections` → moved out of the blanket policy into `QpqWebserverWebsocketConstruct.authorizeManageConnectionsForRole` (mirroring the per-pool Cognito grant from 1.2), scoping to each owned websocket api's `CfnApi.ref` (`arn:aws:execute-api:<region>:<account>:<apiId>/*`); no-op for services without websockets. (3) `apigateway:GET` → per-key: the runtime no longer lists every key in the account (`GetApiKeys` + filter) — it resolves each referenced key's id from its CFN export (`getCFExportNameApiKeyIdFromConfig`, honoring cross-service `ApiKeyReference.serviceName`/`applicationName`) and fetches it individually (`GetApiKey`), so the grant is `arn:aws:apigateway:<region>::/apikeys/*` with an `aws:ResourceTag` condition on `application`/`environment` (+ `feature`) — module deliberately not pinned so same-app cross-service key references keep working. `QpqWebserverApiKeyConstruct` now applies the qpq tags to keys; tags and the policy land in the same inf-phase deploy, so no ordering caveat. An unresolvable key reference degrades to "no match" (as the old list-filter did) rather than an error. (4) `cloudfront:CreateInvalidation` → `arn:aws:cloudfront::<account>:distribution/*` **plus a tag condition** (`aws:ResourceTag` StringEquals on `application`/`module`/`environment`, + `feature` when set — the tags `applyEnvironmentTags` stamps on web-entry and domain-proxy distributions). The distribution id is unknowable at synth (separate web-phase deploy), but tag-based access control is evaluated at call time, so the grant is effectively "this service's own distributions" regardless of deploy ordering. Caveat: distributions deployed before tagging existed must be web-phase-redeployed once to pick up tags, or invalidation gets AccessDenied. Remaining by design: one shared role per service (per the 1.2 note — intra-service per-function least privilege is intentionally not split out); the truly account-wide statements (`cloudformation:ListExports`, ACM describe/list, logs, EC2 ENI) have no resource-level scoping available or are inherently account-level.

[x] 11.1 No AWS budget or cost alerting — account-level budget + cost anomaly detection, config-driven, deployed in bootstrap.
New `defineBootstrapBudget(name, monthlyLimitUsd, subscriberEmails, options?)` in `quidproquo-config-aws` (bootstrap-scoped, mirroring `defineBootstrapCloudTrail`) → `QpqBootstrapConfigBudgetConstruct` in `BootstrapQpqServiceStack`. Creates an `aws_budgets.CfnBudget` (`COST`/`MONTHLY`) with per-threshold email alerts — defaults: 80% actual, 100% forecasted, 100% actual, 150% actual (overridable via `thresholds`) — plus Cost Anomaly Detection on by default: a `DIMENSIONAL(SERVICE)` `CfnAnomalyMonitor` + `CfnAnomalySubscription` (frequency `DAILY`, required for EMAIL subscribers; `IMMEDIATE` is SNS-only) alerting the same emails when anomaly impact ≥ `minimumImpactUsd` (default $10); opt out per-setting via `anomalyDetection.disabled`. AWS allows one service-dimension anomaly monitor per account, so expected usage is one `defineBootstrapBudget` per account. Delivery is deliberately direct email (self-contained in bootstrap, no cross-phase coupling); routing via the notify-error event bus SNS topic is possible later but needs a `budgets.amazonaws.com` publish grant on the topic policy. Cost-allocation tags: `environment`/`application`/`module` tags are already applied by `applyEnvironmentTags`; *activating* them for Cost Explorer is not CloudFormation-able — one-time manual step in the billing console (Cost Allocation Tags → activate), documented here rather than a code gap.

[x] 8.1 DESTROY removal policy on stateful resources — data stores now default to safe removal, config-driven opt-out for dev.
Data stores (storage-drive S3 buckets, KVS DynamoDB tables, Cognito user pools, Neptune graph DB clusters) default to safe removal via `defineAwsDataStoreRemovalPolicy` (in `quidproquo-config-aws` — RemovalPolicy is a CloudFormation concept, so it stays off core config): undeclared = `RETAIN` (+ `deletionProtection` on tables and user pools, since RETAIN alone only orphans on stack delete, and `autoDeleteObjects` off on buckets) — except Neptune, which uses `SNAPSHOT` (final snapshot preserves the data without keeping an orphaned live cluster running/billing); dev configs declare `destroy` to keep full-teardown behaviour. Deliberately left as DESTROY (accepted): secrets, queues (+ DLQ messages), log groups (logs also shipped to S3), web-entry bucket (rebuildable static assets). The CloudTrail bucket was already RETAIN; only its optional CloudWatch mirror log group is DESTROY. Extend the same setting to these if that stance changes.

[x] 7.4 File upload not validated — Busboy now runs with enforced limits, an optional MIME whitelist, and sanitized filenames.
`parseMultipartFormData.ts` passes Busboy `limits` (`fileSize`/`files`/`fields`/`fieldSize`) resolved from a new webserver-layer setting `defineFileUploadSettings(partial)` via `qpqWebServerUtils.getFileUploadSettings` — defaults apply even when the setting isn't declared (10MB per file to match the API Gateway payload cap, 10 files, 100 fields, 1MB per field). An optional `allowedMimeTypes` whitelist (`type/*` wildcards supported) rejects disallowed content types, and filenames are reduced to a path-traversal-safe basename (`sanitizeFilename`: strips `/` and `\` segments, control chars, dot-only names). Truncated uploads fail instead of silently succeeding (Busboy's `limit`/`filesLimit`/`fieldsLimit` events reject with a named `FileUploadValidationError` carrying a `FileUploadErrorTypeEnum`). Violations don't 5xx the event: the getRecords processor stamps `fileUploadError` on the `HTTPEvent` record and the HTTP auto-respond step returns the mapped status (413 fileTooLarge/tooManyFiles, 415 disallowedMimeType, 400 tooManyFields/malformed) with CORS headers, after auth so a 401 still wins; malformed multipart bodies (previously an unhandled Lambda crash) now map to a clean 400. Also fixed the O(n²) per-chunk `Buffer.concat` by collecting chunks and concatenating once. Config lives in `quidproquo-webserver` (multipart-over-HTTP is a web concern), enforcement in the awslambda processor.

[x] 13.1 Alarm framework — namespace support completed + per-resource default alarms auto-instantiated.
The alarm config schema already modelled Lambda/ApiGateway/DynamoDb/Sqs, but the construct only handled Lambda (`else throw`). Since the alarm is built entirely from the shared `BaseAwsAlarmQPQConfigSetting` fields, the per-namespace branch was pointless — removed it, so `QpqConfigAwsAlarmConstruct` is now namespace-agnostic (all four + any future namespace work from config). Deleted a byte-identical dead duplicate at `feature/core/alarm`. For auto-instantiation, a shared `createDefaultResourceAlarm(scope, qpqConfig, props)` helper creates sensible per-resource default alarms and routes them to the service's error-notification bus (reusing `defineNotifyError`'s target — no new routing concept). Opt-in: no-op unless a `defineNotifyError` is declared. Wired in: SQS (`ApproximateAgeOfOldestMessage` backlog + any dead-letter message), DynamoDB (`ReadThrottleEvents`/`WriteThrottleEvents`), API Gateway (`5XXError`). Per-resource dimensions are required for these because API/DynamoDB/SQS publish no account-level metric rollup (unlike Lambda). Lambda stays covered by the existing account-aggregate Errors/Throttles alarms in `QpqCoreNotifyError`.

[x] 13.3 Alert routing has no subscribers — event buses can now fan out to external endpoints.
A new AWS config setting `defineEventBusQuickSubscription(eventBusName, EventBusQuickSubscription[])` (in `quidproquo-config-aws`) declares direct SNS subscribers per bus — `{ type: 'email', email }` or `{ type: 'url', url }` (incident webhook, http/https auto-detected). `QpqCoreEventBusConstruct` resolves them via `qpqConfigAwsUtils.getEventBusQuickSubscriptions(qpqConfig, busName, busOwner)` and maps to SNS `EmailSubscription`/`UrlSubscription`. Supports an `owner` (mirroring `defineEventBus`) so a quick-sub declared in a shared app-level config binds only to the matching owner's bus (owner-less quick-subs match by name, for the single-service case); only the bus's owning service applies subscriptions, preserving the "owner controls subscribers" trust boundary. Combined with alarm routing (`onAlarm.publishToEventBus`) this is how alerts reach a human/PagerDuty/Slack/OpsGenie out-of-band. Deliberately lives in config-aws, NOT on core's `defineEventBus`: direct email/webhook delivery with no compute is an SNS-specific capability, not a portable event-bus concept (other runtimes would need the bus→queue→function pattern). Same layering rule as the storage-drive CORS setting — platform-specific concerns sit in the platform's config layer, keyed by the resource name, resolved at deploy.

[x] 2.1 JWT decoded without signature verification — audit complete; `unsafeDecodeJWTPayload` confirmed never used for authorization, and the guards that enforce this are in place and tested.
Full call-site audit: every authorization/trust decision uses the signature-validated decode (`askRouteAuthValidationDecode` → `decodeValidJwt`, RS256+JWKS), never the unsafe base64 decode. (1) HTTP route auth (`askValidateRouteAuth`) rejects `!decoded.wasValid` — covered by `askValidateRouteAuth.test.ts` ("rejects when the token decodes but is not valid" with `wasValid: false`). (2) WebSocket auth (`askProcessOnAuthenticate`) authenticates via `askUserDirectorySetAccessToken` → `decodeValidJwt` (Cognito-validated). (3) `unsafeDecodeJWTPayload` has exactly two callers: the dev path (`decodeAccessTokenForDev`, dev-only) and the no-auth-route branch of `askGetHttpApiEventStorySession`, which stamps `wasValid: false` and is used only to enrich logs — pinned by `askGetHttpApiEventStorySession.test.ts`. (4) The only non-logging consumer of a possibly-unverified `username` is the token-refresh processor; it can't gate on `wasValid` (refresh must accept signature-valid-but-*expired* tokens), but the trust anchor there is the refresh token itself — Cognito's `REFRESH_TOKEN_AUTH` validates it and `SECRET_HASH` binds it to the username, so a forged username cannot mint another user's tokens (documented inline). Residual contract (not a framework bug): on a *no-auth* route, `session.decodedAccessToken` carries unverified identity with `wasValid: false`, so user business logic must check `wasValid` before trusting `userId`/`username` for anything security-sensitive.

[x] 7.1 Overly permissive CORS — all three wildcard sites now scoped/config-driven with a domain-derived default.
Three surfaces, all addressed. (1) **API** (`headerUtils.ts`): dropped `Access-Control-Allow-Headers: *` / `Allow-Methods: *` — also a latent bug, since literal `*` is invalid once `Allow-Credentials: true`, so authenticated preflights carrying `Authorization`/custom headers were failing. It now reflects the preflight's `Access-Control-Request-Headers`/`-Method` with explicit fallbacks and widens `Vary`; origin allowlisting was already correct. (2) **S3 storage-drive bucket**: CORS is web-only, so it lives entirely in the webserver layer (core `defineStorageDrive` untouched). New `defineStorageDriveCorsSettings(storageDriveName, allowedOrigins)` setting; `qpqWebServerUtils.getStorageDriveCorsAllowedOrigins` resolves it; the core `QpqCoreStorageDriveConstruct` stays domain-agnostic (takes a resolved `corsAllowedOrigins` prop, default `['*']`) and `InfQpqServiceStack` injects it by drive name. (3) **CloudFront web-entry** `ResponseHeadersPolicy`: new `corsAllowedOrigins?` on `defineWebEntry`, applied to `accessControlAllowOrigins`. Shared `resolveServiceScopedCorsAllowedOrigins(qpqConfig, explicit?)` backs both (2) and (3): explicit list wins, else scope to the service domain (`https://<domain>` + `https://*.<domain>`, an S3/CloudFront-supported single-level wildcard), else `['*']` when no DNS base is configured. Pass `['*']` explicitly to restore allow-any-origin (e.g. public-CDN / cross-origin-font web entries).

[x] 1.2 Overly broad Cognito permissions — now scoped to owned user pools (by design).
Admin Cognito actions are granted only when a service owns user directories (`getOwnedUserDirectories`), and `resources` is scoped to exactly those pools' ARNs (`...:userpool/${userpoolId}`) in `authorizeAdminActionsForRole`. A service that only references a foreign directory gets no Cognito IAM — token validation runs against the pool's public JWKs over HTTPS and needs none. The old "every Lambda gets admin on every pool" behaviour is gone.

> **Note:** Now only the service that owns a user pool can administer it, scoped to that pool's ARN. All functions in the owning service share one role by design (single-shared-role-per-service model), so intra-service per-function least privilege is intentionally not split out.

[x] 8.2 DynamoDB point-in-time recovery optional — now on by default, opt-out.
`QpqCoreKeyValueStoreConstruct.ts` sets `pointInTimeRecoveryEnabled: !disablePointInTimeRecovery`, so PITR (35-day continuous backups) is on by default. The old `enableMonthlyRollingBackups` config field (which only ever gated PITR, and was misnamed) was replaced with `disablePointInTimeRecovery?: boolean` in `keyValueStore.ts` as an explicit per-table escape hatch.

[x] 7.5 CSP connect-src too broad — now scoped to specific bucket domains.
`securityHeaders.ts` no longer appends the `https://*.amazonaws.com` wildcard. A new `getStorageDriveConnectSrcDomains(qpqConfig)` enumerates the service's storage drives (owned + referenced) via `qpqCoreUtils.getStorageDrives`, computes each deterministic bucket name (`awsNamingUtils.getConfigRuntimeResourceNameFromConfigWithServiceOverride`) and the owner's region (`resolveAwsServiceAccountInfo`), and emits one `https://<bucket>.s3.<region>.amazonaws.com` entry per drive — the exact virtual-hosted endpoints the browser uses for presigned (secure) URLs. The browser hits no other `amazonaws.com` endpoints (API via custom domain, Cognito server-side), so nothing else needs allowing. Also removed a stray `console.log` that dumped the CSP on every synth.

[x] 6.2 No S3 versioning on any bucket — now versioned by default.
`versioned: true` is set on both the storage-drive bucket (`QpqCoreStorageDriveConstruct.ts`) and the web-entry bucket (`WebQpqWebserverWebEntryConstruct.ts`), so a bad deploy or accidental overwrite can be rolled back. `autoDeleteObjects: true` still purges all versions on `cdk destroy`, so teardown is unaffected. (Full data-loss-on-`destroy` is tracked separately under 8.1.)

[x] 8.3 .gitignore missing .env patterns — patterns added.
`.gitignore` now ignores `.env`, `.env.local`, and `.env.*.local` so local secret files can't be committed accidentally. (No `.env` files were already tracked.)

[x] 1.3 No password policy on Cognito user pool — now configured.
`QpqInfCoreUserDirectoryConstruct.ts` sets `passwordPolicy` with `minLength: 12` and requires lowercase, uppercase, digits, and symbols.

[x] 1.4 No MFA configured — now a configurable property.
The user pool sets `mfa` from config (`mapMfaMode`) plus `mfaSecondFactor` (TOTP). MFA is supported and can be optional/required (default `off` per config).

[x] 1.5 Self-signup enabled by default — now defaults to disabled.
`userDirectory.ts` sets `selfSignUpEnabled: options?.selfSignUpEnabled ?? false`.

[x] 2.2 OAuth2 flow missing PKCE and state validation — vulnerable flow removed.
`exchangeOauth2TokenForAccessToken.ts` no longer exists; no client-side OAuth2 token-exchange / `code_verifier` / `code_challenge` code remains in `quidproquo-web`.

[x] 2.3 OAuth client secrets in configuration — removed from config.
`clientSecret` is no longer a config field; the secret is fetched at runtime from Cognito via `DescribeUserPoolClientCommand` (`getUserPoolClientSecret.ts`) rather than stored in config / CloudFormation.

[x] 2.4 Non-constant-time API key comparison — now constant-time.
`getApiKeyValidationValidateActionProcessor.ts` uses `crypto.timingSafeEqual` via a `safeEqual` helper with a length guard; no `===` on the key value.

[x] 3.1 Log retention set to 1 week — now 1 year.
`basic/Function.ts` sets `retention: aws_logs.RetentionDays.ONE_YEAR`.

[x] 3.2 Environment variables logged to CloudWatch — log statements removed.
`getApiGatewayEventHandler_redirect.ts` no longer logs `process.env`, and `getApiGatewayEventHandler.ts` no longer logs the full API Gateway event (auth headers).

[x] 3.3 No CloudTrail integration — trail added.
`QpqBootstrapConfigCloudTrailConstruct.ts` creates an `aws_cloudtrail.Trail`, wired into `BootstrapQpqServiceStack.ts`.

[x] 3.4 X-Ray tracing disabled — now active by default, configurable.
`basic/Function.ts` sets `Tracing.ACTIVE` unless explicitly disabled via config (`isTracingDisabled`).

[x] 3.5 API Gateway logging disabled — access/execution logging enabled.
`ApiQpqWebserverApiConstruct.ts` sets `cloudWatchRole: true`, an access log group with `accessLogDestination` + `accessLogFormat`, `loggingLevel: ERROR`, and `metricsEnabled: true`.

[x] 3.6 JWT error logging may contain token data — now sanitized.
`decodeValidJwt.ts` logs only a sanitized `${e.name}: ${e.message}` summary, not the full exception or token.

[x] 4.1 No encryption at rest for S3 — now configurable.
`QpqCoreStorageDriveConstruct.ts` sets `encryption`/`encryptionKey` supporting customer-managed KMS (by ARN) or S3-managed when the config flag is set. (Default is unencrypted when the flag is off.)

[x] 4.2 No encryption at rest for DynamoDB — now configurable.
`QpqCoreKeyValueStoreConstruct.ts` sets `encryption`/`encryptionKey` supporting CUSTOMER_MANAGED (KMS) or AWS_MANAGED when the config flag is set. (Default is AWS default SSE when off.)

[x] 7.3 Stack traces returned to clients — no longer leaked.
The node processor was removed; the surviving JS processor uses `actionResultErrorFromCaughtError`, which returns a generic message and does not include `err.stack`.
