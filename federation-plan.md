# Module Federation on Lambda — Plan

Replace the build-time static loader (the generated `quidproquo-dynamic-loader` if-chain that bundles all user code into every Lambda zip) with webpack Module Federation, where each service's story code is built as a **federated remote**, published to an **S3 bucket**, and loaded by a thin, generic Lambda **host** at runtime.

---

## Status — framework integration landed (2026-07-07)

Phase 0 POC is complete (see `federation-poc/lambda-poc/`). The framework wiring is now implemented as an **opt-in, fall-back-safe** layer — nothing changes for existing apps until they publish to the bucket. See `federation-usage.md` for the consumer build/publish flow.

**What's implemented and verified (e2e: webpack remote build → publish → federated load → story ran, multi-chunk + shared `quidproquo-core`):**

- **`quidproquo-deploy-webpack/src/federation/`** — `getWebpackConfigForQpqRemote(qpqConfig, buildPath)` builds the service as an MF remote container (exposes derived from `getAllSrcEntries`, `quidproquo-core`/`quidproquo-webserver` shared, `commonjs-module`/`async-node`). `publishFederatedRemote(qpqConfig, buildPath, publishPath)` writes the content-hash version dir + `manifest.json` (written last). `getFederatedRemoteInfoForQpqConfig` derives the container name + `runtime → expose` map. Unit-tested.
- **`quidproquo-actionprocessor-awslambda/src/logic/federatedModuleStore/`** — `loadFederatedStory(qpqConfig, runtime)`: resolves the store once per lambda container (manifest → sync to `/tmp` → require container from disk → MF `init`/`registerRemotes` with the host providing shared framework libs), then `loadRemote` + export lookup. Returns `undefined` on **any** miss. Unit-tested (including missing-store, unexposed-runtime, missing-export).
- **`.../lambdas/dynamicModuleLoader/dynamicModuleLoader.ts`** — now tries `loadFederatedStory` first, falls back to the bundled `qpqDynamicModuleLoader` if-chain. This is the single seam every lambda entry already uses.
- **`quidproquo-deploy-awscdk`** — `QpqCoreFederatedCodeStoreConstruct` deploys the private, versioned code bucket **in the api stack** (`ApiQpqServiceStack`), grants the service role `s3:GetObject`+`s3:ListBucket` on it, and `basic/Function.ts` sets the `federatedCodeStoreUrl` env var on **every** lambda. Bucket name via `awsNamingUtils.getFederatedCodeStoreBucketName` (`fedcode-` prefix — short, to stay under the S3 63-char limit).

**Remaining before production use:**
- Consumer app must add a remote build + publish step (documented in `federation-usage.md`); no consumer wiring exists in this monorepo (external apps only).
- Host webpack config does **not** need an MF plugin — the lambda-side loader calls the MF runtime `init()` directly with the host's already-bundled framework packages as shared libs. (Originally planned as a separate step; proved unnecessary.)
- Real-lambda deploy of the integrated path (POC proved the mechanism in-lambda; the framework version hasn't been round-tripped through an actual `cdk deploy` yet).
- Cross-service federation (Phase 5) and the deploy-time version gate are still open.

---

## 1. Where we are today

- A `QpqFunctionRuntime` (`/entry/controller/admin::onAuthUpdate`) identifies code by path + export name (`quidproquo-core/src/types/QpqFunctionRuntime.ts`).
- `DynamicModuleLoader = (runtime) => Promise<any>` (`quidproquo-core/src/types/DynamicModuleLoader.ts`) is already threaded through the entire runtime (`createRuntime`, `resolveStory`, every action processor). **This abstraction is the seam — core needs almost no changes.**
- At build time, `QpqPlugin` (`quidproquo-deploy-webpack/src/plugins/QpqPlugin.ts`) emits a virtual module whose `qpqDynamicModuleLoader` is an if-chain of literal `require()` calls (`getSrcLoaderForQpqConfig.js`), so webpack statically bundles every module referenced by `getAllSrcEntries(qpqConfig)`.
- CDK ships each function type's bundle inline via `Code.fromAsset` (`quidproquo-deploy-awscdk/src/constructs/basic/Function.ts`). Every code change = full rebuild + CFN asset update of every lambda.

## 2. Target architecture

```
BUILD (per service)                       RUNTIME (any lambda)
──────────────────                        ────────────────────
webpack MF remote build                   thin host bundle (no user code)
  exposes: one entry per file               │
  referenced by getAllSrcEntries            ├─ cold start: read manifest.json (S3)
  library: commonjs-module                  ├─ sync modules/<svc>/<hash>/ → /tmp
  target: async-node                        ├─ init container (createRequire, global)
        │                                   └─ loadRemote('<svc>/<path>')[fnName]
        ▼                                        │
s3://<code-bucket>/modules/<svc>/<hash>/         ▼
  remoteEntry.js + chunks                  resolveStory(story, params)
  manifest.json  ← atomic pointer flip
```

Key properties:

- **Host lambda bundle is generic and stable** — qpq runtime, action processors, MF runtime, shared deps. It only changes when the framework changes, not when user code changes.
- **User-code deploy = S3 upload + manifest flip.** No CloudFormation, no lambda update, seconds not minutes. Rollback = repoint the manifest.
- **Shared scope**: host provides `quidproquo-core` (and other heavy shared deps) as MF `shared` singletons, so remotes contain only user story code — small remotes, fast cold-start fetch.
- **Cross-service federation** (later phase): `qpqDynamicModuleLoaderForService(serviceName, runtime)` becomes `loadRemote('<otherService>/<path>')` — a real capability today's static bundling can't offer.

## 3. What the POC proved / what's still unknown

Proved (`federation-poc/`):

- `@module-federation/enhanced` + `@module-federation/node/runtimePlugin` works with `target: 'async-node'` and `library: { type: 'commonjs-module' }`.
- A custom runtime plugin's `afterResolve` hook can intercept remote resolution, load the container from a non-HTTP source (`createRequire(file)`), stash it on `globalThis`, and switch `remoteInfo.type` to `'global'`. **This is the S3 loader's insertion point** — replace "read from sibling dist folder" with "download S3 prefix to /tmp".

Unknown — Phase 0 must answer:

1. Does the FS-container trick work when the remote has **multiple chunks** (`chunkFilename: '[id]-[contenthash].js'`)? Node-target chunk loading requires chunks relative to the entry file, so syncing the whole version prefix to one /tmp dir should work — verify.
2. Cold-start cost of manifest read + prefix sync + container init in a real Lambda (expect < 300ms for a small remote; measure).
3. MF runtime version compatibility between host bundle and remotes built at different times (pin `@module-federation/*` exactly; verify a version-skewed remote still loads or fails loudly).
4. `shared` singleton behavior in the node runtime — remote resolves `quidproquo-core` from the host's share scope rather than bundling its own copy.

## 4. Design decisions (recommendations)

| Decision | Recommendation | Why |
|---|---|---|
| Fetch transport | **S3 SDK → /tmp, then FS load** (POC pattern), not HTTP/CloudFront | IAM-native, no public/read-signed endpoint, no infra beyond the bucket; /tmp doubles as warm-invocation cache |
| Expose granularity | One expose per source file: `./entry/controller/admin` → `./src/entry/controller/admin.ts`, deduped across all `getAllSrcEntries` runtimes; export picked by the `::functionName` suffix at load time | Maps 1:1 onto the existing `QpqFunctionRuntime` split (`getSrcFilenameFromQpqFunctionRuntime` / `getStoryNameFromQpqFunctionRuntime`) — no format change, no user migration |
| Versioning | Content-hash prefix `modules/<service>/<buildHash>/`, plus `modules/<service>/manifest.json` written last as the atomic "current" pointer | Immutable artifacts, atomic cutover, trivial rollback; manifest carries per-file integrity hashes |
| Manifest refresh | Resolve at cold start; pin per-container (no mid-life hot swap) by default; optional TTL refresh behind config later | Deterministic invocations; hot swap is a feature flag, not a default |
| Bucket scope | One code bucket **per service deployment**, name derived from accountId/region/config-name (no name overrides) | Shared AWS account: exact-ARN IAM grants, no account-scoped wildcards; write access restricted to that service's deploy role |
| Mode switch | New AWS-layer config setting (in `quidproquo-config-aws`, keyed by service, resolved at deploy) with enum `ModuleLoadingMode { bundled = 'bundled', federated = 'federated' }`, default `bundled` | Platform concern stays off core config; existing apps unaffected until they opt in |
| Failure semantics | Build-time validation that every `getAllSrcEntries` runtime has a matching expose; runtime loader throws a named `Error` subclass (`FederatedModuleLoadError` with `readonly code`) on missing remote/expose/export | The static if-chain's "can't build if missing" guarantee moves to a deploy gate instead of silently becoming a runtime 500 |

**Alternative considered:** skip MF and just bundle each entry file to S3 + `require()` from /tmp. Simpler, but loses shared-scope dedupe (every entry re-bundles `quidproquo-core`), loses cross-service imports, and re-invents the manifest/runtime MF already provides. MF is the right call given the POC works.

## 5. Phased implementation

### Phase 0 — Lambda-shaped POC (extend `federation-poc/`)

> Status: **COMPLETE** — built at `federation-poc/lambda-poc/` and verified end-to-end in a real lambda (`qpq-federation-poc-host`, nodejs22, ap-southeast-2) loading from `s3://views-mincept-shell-development/modules/remotesvc`. All exit criteria pass: multi-chunk /tmp loading, shared singleton, warm-cache reuse (0ms), manifest-flip code deploy with an unchanged host, MF version skew (0.18.2 host ↔ 2.6.0 remote worked), deterministic content hashes, and in-lambda cold start ~520-630ms for the full federation load (warm 0-2ms). See the POC README for the full checklist. Next: Phase 1.

Goal: de-risk everything in §3 before touching framework packages.

- Add `poc-host-lambda/`: a handler bundled like today's lambdas (target node, commonjs2) that registers `nodePlugin` + a new `s3FetchPlugin` and calls `loadRemote('app2/multiply')`.
- `s3FetchPlugin`: `afterResolve` → if not already in /tmp, `ListObjectsV2` + `GetObject` the version prefix → /tmp → `createRequire` the local remoteEntry → global container (straight port of `nodeFSFetchPlugin`).
- Add a multi-chunk expose (dynamic `import()` inside an exposed module) to prove chunk loading from /tmp.
- Add a `shared` dep to both host and remote; verify singleton resolution.
- Deploy by hand (console or a 20-line CDK app), measure cold/warm timings.

Exit criteria: multi-chunk remote + shared singleton loads from S3 in a real Lambda; timings acceptable; MF versions pinned.

### Phase 1 — Remote build tooling (`quidproquo-deploy-webpack`)

- `getWebpackConfigForQpqRemote(qpqConfig, ...)`: generates the `ModuleFederationPlugin` remote config — `name` = service name, `exposes` derived from `getAllSrcEntries` (deduped per file), `filename: 'remoteEntry.js'`, `library: commonjs-module`, `target: async-node`, `shared` = framework packages, content-hashed chunk filenames.
- Manifest emitter: build step that writes `manifest.json` (build hash, file list + integrity hashes, MF runtime version, qpq version).
- Build-time validation: every runtime in `getAllSrcEntries` maps to an expose; fail the build otherwise.

### Phase 2 — Runtime loader (`quidproquo-actionprocessor-awslambda`)

- `createFederatedDynamicModuleLoader(config)` implementing `DynamicModuleLoader`:
  - Reads bucket/service/manifest key from env vars set by CDK.
  - Cold start: fetch manifest → sync prefix to `/tmp/qpq-modules/<service>/<hash>/` (skip files already present — warm containers reuse) → verify integrity hashes → `registerPlugins` + init container.
  - `load(runtime)`: parse with existing `getSrcFilenameFromQpqFunctionRuntime` / `getStoryNameFromQpqFunctionRuntime` → `loadRemote('<service>/<path>')` → return `module[functionName]`.
  - Module-level promise cache so concurrent loads during one cold start don't double-fetch.
  - Named error subclass with `code` for every failure (manifest missing, integrity mismatch, expose missing, export missing).
- Host virtual-module change: in federated mode, `QpqPlugin` emits a loader that delegates to this instead of the if-chain (the `quidproquo-dynamic-loader` import surface in `lambdas/dynamicModuleLoader/dynamicModuleLoader.ts` stays identical).

### Phase 3 — Infra + deploy flow (`quidproquo-config-aws`, `quidproquo-deploy-awscdk`)

- Config: the `ModuleLoadingMode` setting in `quidproquo-config-aws` (per-service, default `bundled`).
- CDK (infra phase, honoring separate-deploy-per-phase):
  - Code bucket construct — derived name, versioned, private, SSE; deploy-role-only writes.
  - Lambda role: `s3:GetObject`/`ListBucket` on the exact bucket ARN + `modules/<service>/*` prefix only.
  - `Function.ts`: in federated mode the asset is the thin host bundle; add env vars (bucket, service, manifest key).
- Publish step: upload `dist-remote/` to the hash prefix, write manifest last. Start as a CLI/script step in the consumer app's deploy (fits the "deploy code without CFN" goal better than `BucketDeployment`).

### Phase 4 — Integration + dev parity

- Wire federated mode end-to-end in a real consumer app behind the config flag; run both modes side by side.
- Dev server keeps its direct `dynamicModuleLoader` (no MF locally); optionally add an FS-federation mode later for parity testing.
- Deploy-gate check: manifest's qpq/MF versions compatible with the running host bundle version.

### Phase 5 — Cross-service federation

- Service registry: each service's manifest location discoverable via SSM (deploy-time refs, consistent with the bootstrap/SSM pattern).
- `qpqDynamicModuleLoaderForService(serviceName, runtime)` → register the other service's remote on demand → `loadRemote('<otherService>/<path>')`.
- Cross-service IAM: exact-ARN read grants on the other service's code bucket prefix.

### Phase 6 — Cutover & cleanup

- Default new apps to `federated`; migrate existing ones; keep `bundled` as an escape hatch for at least one release cycle.
- Retire the if-chain generator (`getSrcLoaderForQpqConfig.js`) once nothing uses it.

## 6. Risks & mitigations

- **Cold-start regression** — remotes are tiny (user code only, shared deps from host); /tmp cache survives warm starts; measure in Phase 0 before committing.
- **MF runtime version skew** (host built months before a remote) — pin `@module-federation/*` exactly; record versions in the manifest; deploy-gate on mismatch.
- **Supply-chain surface** (the bucket *is* remote code execution) — private bucket, deploy-role-only writes, exact-ARN grants (critical in the shared multi-app account), integrity hashes verified after download, S3 object versioning + access logging.
- **Runtime-missing-module class of failure** replaces build-time guarantees — Phase 1 build validation + named errors + the deploy gate keep it a deploy-time failure, not a 3am one.
- **`QpqFunctionRuntimeAdvanced.globals`** — confirm how the if-chain handles `globals` today and replicate in the federated loader (flagged for Phase 2).
- **/tmp limits** — 512MB default is plenty for user-code remotes; configurable to 10GB if ever needed.

## 7. Open questions

1. Is mid-life hot swap (TTL manifest refresh, new code without a new container) actually wanted, or is "new cold starts pick up new code" enough? Plan assumes the latter.
2. Cross-service loading (Phase 5): load the *code* into the caller's process, or keep cross-service calls going through `ExecuteStory` events? Loading code in-process changes the trust model between services.
3. Should the web/SEO edge lambdas be included, or excluded initially (Lambda@Edge has no useful /tmp story and 50MB limits)? Plan assumes excluded initially.
