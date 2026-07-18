# Multi-Domain Plan: zero-downtime domain swaps

## Goal

An app should be fully live on N root domains at once (web entries, APIs, websockets all
served on every domain), so a domain migration becomes: add the new domain, deploy, verify,
flip primary, remove the old domain. No downtime at any step.

Decisions locked in:

- The domain list is declared in ONE app-level place: a primary root domain plus alternates.
  Per-setting `rootDomain` params keep meaning "one specific domain" (they become legacy
  anchors, see below).
- No 301-redirect mode for retired domains in this scope (follow-up).
- All domains have Route53 hosted zones in the same AWS account.

Useful existing seams: `getDnsConfigs` already returns a list (readers just take `[0]`), and
`WebQpqWebserverDomainProxyConstruct` already loops plural aliases and A records.

## Design summary

**Config**: widen `defineDns(dnsBase, options?)` with `alternateRootDomains?: string[]`.
`dnsBase` stays the primary; every absolute URL the platform generates uses it. Backward
compatible: single-arg calls unchanged, field defaults to `[]`. One setting carrying the list
beats multiple `defineDns` calls, where primacy would depend on config flattening order.

**Accessors** (`quidproquo-webserver/src/utils/qpqConfigAccessorsUtils.ts`): existing
`getDomainName` / `getBaseDomainName` / `getServiceDomainName` keep their code and become
"primary" by definition. New:

- `getAllRootDomains(qpqConfig)`: raw roots, primary first, deduped, folds legacy
  multi-`defineDns` configs, `[]` when undeclared. Guards `alternateRootDomains || []`
  (pre-change serialized configs lack the field).
- `getAllBaseDomainNames(qpqConfig)`: each root through `resolveDomainRoot` (env/feature
  prefixing).
- `findBaseDomainNameForHost(qpqConfig, host)`: `Nullable<string>`; strips `:port`,
  lowercases, matches exact or `.`-suffix, longest match wins, `null` if unrecognized
  (prevents Host-header injection).

**CORS**: `resolveServiceScopedCorsAllowedOrigins` flatMaps `https://<base>` +
`https://*.<base>` over ALL base domains (the `['*']` guard becomes
`getAllRootDomains(...).length === 0`). `getAllowedOrigins` in `headerUtils.ts` seeds with
every base domain (primary first, so the `allowedOrigins[0]` fallback in `getCorsHeaders`
stays the primary) and expands each `ServiceAllowedOrigin` entry that has no explicit
`.domain` once per base domain. Storage-drive CORS and the CDK ResponseHeadersPolicy inherit
for free.

**Request-host awareness**: the CloudFront SEO record's `domain` becomes "the configured base
domain this request arrived on": `findBaseDomainNameForHost(host) ?? getBaseDomainName(...)`.
API-gateway records already carry the Host header; no `domain` field added to `HTTPEvent` in
this scope. New story `askGetEventBaseDomain(headers)` lets app stories be host-aware
deterministically.

**Certs (the crux)**: a CloudFront distribution has ONE viewer cert, so serving two apexes
from one distro needs one cert spanning both.

- The us-east-1 CloudFront cert becomes a combined multi-apex cert validated with
  `CertificateValidation.fromDnsMultiZone` (per-FQDN zone map), keyed by a STABLE app key,
  never a domain: stackName `${idPrefix}-cert-app`, new SSM param
  `/qpq/domain/app-certificate-arn/<region>/<application>-<environment>[-<feature>]`
  (mirrors the WAF param pattern; cannot collide with per-domain params, so deleting orphaned
  legacy cert stacks can never wipe it).
- The combined `Certificate` gets `RemovalPolicy.RETAIN`: domain-set changes replace the ACM
  cert, and RETAIN makes that unconditionally safe while old distros still reference the old
  one (manual cleanup of retired certs, documented).
- Regional API certs stay per-domain (`/qpq/domain/certificate-arn/<region>/<root>`
  unchanged): adding a domain adds stack `<prefix>-cert-<root>`, removing deletes it.

**Fan-out with stable logical IDs (the "legacy anchor" scheme)**: renaming logical IDs of
`DomainName` / `RecordSet` resources is create-before-delete and hard-fails on physical name
collision, so existing resources must keep their IDs. New util
`resolveDeployDomains(qpqConfig, anchorRootDomain?)` returns `{ rootDomain, useLegacyIds }[]`:

- No app domains declared: legacy mode, single anchor domain, identical synth output to today
  (byte-identical templates is a test target).
- App domains declared: every domain gets resources; the setting's explicit `rootDomain` arg
  is the anchor and keeps today's IDs (`subdomain`, `bpm`, `web-alias`, `apex-zone`); other
  domains get `-<sanitized-root>` suffixed IDs via `domainScopedId`. Throws if the anchor
  isn't in the app list.
- Flip-primary changes nothing in CloudFormation (primary-ness is runtime-only; the deploy
  side never reads primary). Removing the old domain plus dropping the anchor args is pure
  deletes.
- Requires making `rootDomain` optional on `defineApi`, webEntry `WebDomainOptions`, and
  websocket settings (omitted = pure app-domain mode, all IDs domain-keyed).

**Pinned single-domain surfaces**: Cognito `UserPoolDomain` supports one custom domain per
pool; it stays pinned to `dnsRecord.rootDomain` (already explicit config). Its cert lookup
switches to the app cert when app domains are declared, so the app cert must cover the auth
FQDN. Auth-domain migration is a separate deliberate op (brief hosted-UI outage; bearer
tokens stay valid, the issuer is the pool URL). Module-federation remote URLs stay baked to
the primary (cross-origin fetch from the alternate works once CORS covers all domains);
host-relative MF URLs are a follow-up.

## Tasks

### Phase A: config + accessors (quidproquo-webserver)

- [ ] `src/config/settings/dns.ts`: widen setting + `defineDns` options
      (`QPQConfigAdvancedDnsSettings` with `alternateRootDomains?`)
- [ ] `src/utils/qpqConfigAccessorsUtils.ts`: add `getAllRootDomains`,
      `getAllBaseDomainNames`, `findBaseDomainNameForHost`; rewrite
      `resolveServiceScopedCorsAllowedOrigins`
- [ ] `src/utils/headerUtils.ts`: multi-domain `getAllowedOrigins` with an extracted
      `expandAllowedOrigin` helper
- [ ] `src/stories/askGetEventBaseDomain.ts` (new) + barrel export; doc-comment the
      `[0]`-is-primary contract on `askGetDomainRoot`
- [ ] Optional `rootDomain` on `defineApi` / `WebDomainOptions` / websocket settings
- [ ] Unit tests: accessors, headerUtils, stories

### Phase B: runtime processors

- [ ] `quidproquo-actionprocessor-js/.../dns/getDnsListActionProcessor.ts`: return
      `getAllRootDomains(qpqConfig)` (all active roots, primary first)
- [ ] `quidproquo-actionprocessor-awslambda/.../cloudFrontOriginRequest/getEventGetRecordsActionProcessor.ts`:
      record `domain` from request host, validated, primary fallback
- [ ] `quidproquo-dev-server/src/allServiceConfig.ts`: collapse `alternateRootDomains = []`
      along with the localhost rewrite
- [ ] Tests: dnsList processor, cloudFrontOriginRequest host cases, allServiceConfig

### Phase C: certs (quidproquo-config-aws + quidproquo-deploy-awscdk)

- [ ] `config-aws/src/config/settings/domainCertificate.ts`: `rootDomain: string | string[]`
      param, stored as `rootDomains: string[]`, uniqueKey `${sortedRoots.join('|')}::${region}`;
      length-1 synths byte-identical to today
- [ ] `config-aws/src/utils/configUtils.ts`: `getAppDomainCertificateArnSsmParameterName`
- [ ] `DomainCertificateStack.ts`: multi-root path (per-root `apex-zone-<root>` lookups,
      `fromDnsMultiZone`, `RemovalPolicy.RETAIN`, app SSM param, SAN <= 10 validation with an
      actionable ACM-quota error)
- [ ] `createDomainCertificateStacks.ts`: merge key on sorted root list; multi-root stack
      named `${idPrefix}-cert-app`; throw on two multi-root entries in one region
- [ ] `DomainCertificateLookup.ts`: `lookupAppDomainCertificate`; us-east-1 consumers use the
      app cert whenever app domains are DECLARED (not `> 1`)

### Phase D: fan-out constructs (quidproquo-deploy-awscdk)

- [ ] `src/utils/resolveDeployDomains.ts`: `resolveDeployDomains` + `domainScopedId` + tests
- [ ] Per-domain loops: `DomainQpqWebserverApiConstruct`, `ApiQpqWebserverApiConstruct`,
      `WebQpqWebserverWebEntryConstruct` (alias union, per-domain A records, app cert),
      `QpqApiWebserverWebsocketConstruct`, `QpqWebserverSubdomainRedirectConstruct`
- [ ] Cognito: cert-lookup switch only (no fan-out); domain proxy left as-is (follow-up)
- [ ] CDK synth tests: legacy configs keep today's logical IDs; app-domain mode adds only
      suffixed resources; multi-root cert stack emits `fromDnsMultiZone` + app param

### Phase E: deploy plumbing + consumers

- [ ] `qpqAppDeployConfig.ts`: `alternateDomains?` on config; context gains
      `alternateDomains` (default `[]`) + `allDomains`
- [ ] `getWorkspaceQpqConfigs.ts`: bootstrap config declares the domain list beside
      `defineApplication`
- [ ] Consumers (qpqjs + todo): bootstrap cert entries per domain, service-utils threads
      alternates into `defineDns`; anchor args stay pinned to the ORIGINAL domain literal
      during a migration, never `ctx.domain`

### Follow-ups (parked)

- [ ] 301-redirect mode for retired domains
- [ ] Host-relative module-federation remote URLs
- [ ] Domain proxy multi-domain support
- [ ] Auth (Cognito hosted UI) domain migration story

## Cutover runbook

Add newapp.com while oldapp.com is live:

1. Preconditions: Route53 zone for newapp.com in-account; the alias isn't on any other
   CloudFront distro; CAA permits amazon.com; SAN count within quota (the qpqjs reference app
   hits exactly 10 with 2 domains); CDK context refresh for new zone lookups.
2. Add `alternateDomains: ["newapp.com"]` to `deploy.config.json`; keep anchor args as
   `oldapp.com` literals.
3. Deploy the Domain phase (combined us-east-1 cert + regional newapp cert + api DomainName
   and A record), then per service Inf, Web, Api. All changes additive; old logical IDs
   untouched. The old per-domain us-east-1 cert stack becomes unused; delete it only after
   all services have redeployed onto the app cert.
4. Verify both domains end to end. Flip primary = swap `domain` / `alternateDomains` values
   in `deploy.config.json` (anchors stay literal), redeploy Web + services (rebaked MF URLs,
   CORS-primary ordering). Zero CloudFormation identity changes.
5. Remove the old domain: drop it from the list AND drop the anchor args in one change;
   deploy the Domain phase first (cert replaced without old names; the RETAINed old cert
   keeps not-yet-redeployed distros valid), then Web/Api (pure deletes). Manually delete the
   orphaned regional cert stack and RETAINed certs.

## Risks

- ACM 10-SAN default quota: the reference app is exactly at it with 2 domains. Synth-time
  error plus a documented quota-increase path.
- Cert replacement on every domain-set change: made safe by RETAIN; orphaned certs are a
  cleanup chore, never a deploy failure.
- Cross-region SSM custom resource `onDelete` wipes its param: structurally avoided for the
  app cert by the new param namespace; the runbook forbids deleting the app cert stack while
  referenced.
- Anchor misuse (pointing an anchor at `ctx.domain` mid-migration): converted to a synth-time
  error by `resolveDeployDomains` validation where detectable; documented prominently.
