# Compliance / Security Issues

Source: "Security/compliance issue findings (From Claude)" — originally reviewed against `new-auth-oauth`.
Re-verified against the current branch. Open items are listed first (ordered easiest → hardest by rough implementation effort); fixed items (checked) are moved to the bottom.

Legend: `[ ]` = still open, `[x]` = fixed. Items tagged **PARTIAL** have had progress but are not fully resolved, so they remain open. Each open item has an `(effort: …)` estimate.

---

## Open — easiest first

[ ] 2.1 JWT decoded without signature verification — **PARTIAL**; renamed and documented, behaviour unchanged. `(effort: easy)`
`unsafeDecodeJWTPayload` still base64-decodes with no signature check and the dev path calls it. Production uses RS256 + JWKS, so the remaining work is auditing/guarding call sites to ensure it's never used for authorization outside dev.

[ ] 6.4 CloudFront S3 policy allows any distribution in the account — **PARTIAL**; web-entry bucket now scoped to its exact distribution, storage-drive bucket constrained by cross-stack boundary. `(effort: easy)`
`WebQpqWebserverWebEntryConstruct.ts` no longer adds a manual `distribution/*` statement for the bucket it owns: `S3BucketOrigin.withOriginAccessControl` (CDK) auto-adds a policy scoped to that exact distribution's ARN (`StringEquals` on `AWS:SourceArn`), so the redundant broader statement was removed. `QpqCoreStorageDriveConstruct.ts` still uses account-scoped `distribution/*` because its bucket is consumed by a distribution in a *separate* service/deploy phase (imported by name → CDK can't auto-scope it, and the consuming distribution's AWS-generated ID isn't knowable here and can't be cross-referenced per the separate-deploys rule). Account-scoped `distribution/*` is the pragmatic ceiling for that path.

[ ] 7.1 Overly permissive CORS — wildcards in headers, S3, and CloudFront. `(effort: easy)`
`headerUtils.ts`, S3 CORS, and CloudFront all use `*`. Replace with explicit allowed origins, headers, and methods (likely driven from config). Authenticated routes already reject wildcard origins.

[ ] 12.2 No AWS Shield Advanced — only default Shield Standard. `(effort: easy)`
Mostly a cost/decision item: evaluate and optionally enable Shield Advanced for production workloads with SLA requirements. Minimal code.

[ ] 11.2 No reserved capacity or savings plans — opt-in only. `(effort: easy)`
Reserved concurrency is passthrough (undefined by default). Add sensible defaults for critical functions and document a Savings Plans / Reserved Capacity strategy.

[ ] 7.4 File upload not validated — Busboy used with no limits. `(effort: medium)`
`parseMultipartFormData.ts` has no size/count `limits`, no MIME-type whitelist, and no filename sanitization. Add configurable limits, a MIME whitelist, and path-traversal-safe filenames.

[ ] 13.4 No CloudWatch dashboards — none defined. `(effort: medium)`
Add a default operational dashboard per service (request rate, error rate, latency p50/p95/p99, Lambda duration, concurrent executions, DynamoDB capacity, queue depth).

[ ] 13.5 No anomaly detection — none configured. `(effort: medium)`
Enable CloudWatch `AnomalyDetector` on critical metrics (Lambda duration, API latency, error rates) so slow leaks, degradation, and cost creep get surfaced.

[ ] 13.3 Alert routing has no subscribers — alarms fire into a void. `(effort: medium)`
`QpqCoreNotifyError.ts` routes alarms to an SNS topic with no external subscribers. Add configurable SNS subscriptions (email/HTTPS webhook/Lambda) and document PagerDuty/Slack/OpsGenie patterns.

[ ] 8.1 DESTROY removal policy on all stateful resources — hardcoded, not environment-aware. `(effort: medium)`
`RemovalPolicy.DESTROY` is hardcoded on S3 (+ `autoDeleteObjects`), DynamoDB, Cognito, and log groups. Introduce an environment-aware toggle defaulting to `RETAIN`/`SNAPSHOT` for production.

[ ] 11.1 No AWS budget or cost alerting — zero coverage. `(effort: medium)`
Add `aws_budgets.CfnBudget` threshold alerts (80/100/150%), enable Cost Anomaly Detection, and add cost-allocation tags (CostCenter/Team/Project). With PAY_PER_REQUEST + on-demand Lambda, runaway cost is currently unbounded and silent.

[ ] 6.1 No Lambda code signing — no `CodeSigningConfig` / `SigningProfile`. `(effort: medium)`
Create an `aws_signer.SigningProfile` and `aws_lambda.CodeSigningConfig` and attach to all Lambda functions so uploaded code has integrity verification.

[ ] 5.2 Minimal VPC configuration, no flow logs — VPC sets only `maxAzs` and `vpcName`. `(effort: medium)`
Add VPC flow logs (CloudWatch/S3), VPC endpoints (S3/DynamoDB/Secrets Manager), and NAT configuration to the bootstrap VPC construct.

[ ] 5.1 No security groups defined — zero `SecurityGroup` constructs. `(effort: medium-hard)`
Lambdas in VPCs use the default security group. Create explicit security groups with minimal ingress/egress rules per service, exposed through config.

[ ] 13.1 Alarm framework defined but not auto-instantiated — fully opt-in. `(effort: medium-hard)`
Alarms only come from user-defined configs and the construct currently only supports the Lambda namespace. Auto-instantiate sensible defaults per resource (Lambda errors ≥ 1, API 5xx ≥ 1, DynamoDB throttles ≥ 1, SQS message age) and extend namespace support.

[ ] 1.1 Wildcard IAM permissions on shared service role — **PARTIAL**; data-plane wildcards removed, control-plane remain. `(effort: medium-hard)`
`sns:Publish`, `apigateway:GET`, `cloudfront:CreateInvalidation`, and `execute-api:ManageConnections` still use `resources: ['*']`. Scope these to specific ARNs and move toward per-function/per-domain roles instead of one shared role.

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
