# quidproquo-scripts — the invisible harness

Design agreed 2026-07-09, from a review of `~/repo/antero-software/doccypoccy` (the
reference QPQ consumer app). Goal: a consumer repo owns only its apps and a handful
of boring root files; everything else ships as published quidproquo packages, and
"updating the harness" means bumping npm versions — no copy-down, no file merging.

## Problem statement

Today a QPQ app (doccypoccy) carries a large `tools/` directory (deploy/synth/publish
scripts, rspack config builders, a dev-server shell, the CDK app entry) plus root npm
scripts that run it all via ts-node. Updating the harness means hand-merging those
files. Worse, the coupling leaks both ways:

- Every service's `rspack.config.ts` imports the harness by relative path
  (`../../../../../tools/rspack`).
- App-specific build cruft has leaked *into* the "generic" tools: a liquidjs warning
  filter and adm-zip/ws IgnorePlugins live in `tools/rspack/serviceRspackShared.ts`
  only because doccypoccy uses those packages.

The original idea of a copy-down harness ("delete everything except `apps/`, copy the
new harness around it") is **dropped** in favour of an invisible, CRA-style harness.

## The consumer repo, after

```
<repo>/
  apps/                     ← required convention; all else is user's choice
    <app>/
      package.json          ← NEW: thin, app-owned lifecycle hooks (e.g. chakra:typegen)
      deploy.config.json    ← KEPT as JSON; extended (see Deploy identity)
      account.qpq.ts        ← NEW: moved from tools, per app
      bootstrap.qpq.ts      ← NEW: moved from tools, per app
      tsconfig.federated.json
      services/<svc>/{config,models,x-models,shared-logic,x-logic,service-utils,service,views}
      packages/*            ← app-scoped shared packages
  packages/                 ← repo-wide shared libs (e.g. exengne); plain workspaces
  package.json              ← user-owned: hoisted deps, workspaces globs, thin scripts
  tsconfig.base.json        ← one-liner extending quidproquo-tsconfig
  eslint.config.mjs         ← one-liner re-exporting quidproquo-eslint-config
  types/assets.d.ts
```

No wrapper folder around `apps/` + `packages/` — with the harness invisible there is
nothing to delete around them, so the repo is laid out however the user likes as long
as `apps/` exists.

**Dependency hoisting stays.** All app runtime deps live in the root package.json on
purpose: one place to update versions across all apps, and module federation requires
shared singletons (react etc.) to agree across every independently built bundle.
Root package.json is entirely user-owned; qpq's only claims on it are a
`quidproquo-scripts` devDep, the workspaces globs, and thin alias scripts.

## quidproquo-scripts (the `qpq` CLI)

- Published from the quidproquo monorepo. Declares `"bin": { "qpq": ... }` — bin
  names are not registry-namespaced, so the taken `qpq` npm package name doesn't
  matter. npm scripts resolve `node_modules/.bin/qpq` locally.
- **CLI only**: command parsing, app/service discovery (`apps/*/services/*`),
  orchestration, interactive prompts. All real logic pushes down into the packages it
  calls:
  - rspack service/views config builders, federated exports → `quidproquo-deploy-rspack`
  - dev-server shell + dynamicModuleLoader glue → `quidproquo-dev-server`
  - CDK app entry + cdk.json → `quidproquo-deploy-awscdk` (CDK is identical for all
    products; nothing CDK-shaped lives in the consumer repo)
- **Fat CLI**: hard-depends on deploy-rspack, deploy-awscdk, dev-server, etc. One
  install, no plugin discovery. It's dev tooling; weight is fine.
- **Zero package-specific knowledge**: no liquidjs/adm-zip/ws special cases baked in.
  That cruft moves to the consumer's own config (see bundle options below). Hard
  line — otherwise the ignore list grows forever with every consumer's pet dependency.
- Command names keep the muscle memory: `qpq go`, `qpq go:dev`, `qpq go:dev:web`,
  `qpq synth`, `qpq prep`, `qpq publish[:build|:upload|:deploy]`, `qpq go:docker`.
  Root package.json keeps aliases like `"go": "qpq go"`.

## Per-service boilerplate → gone

Services lose `rspack.config.ts` entirely (the CLI bundles from QPQ config +
convention; today's file is a 3-line shim anyway). What remains per workspace
package is the npm-required minimum: a name-only `package.json` and a ~3-line
`tsconfig.json` stub extending quidproquo-tsconfig (kept for editor experience —
go-to-def and squiggles need real tsconfig files on disk).

## New config settings

### Layers provide modules (externals derived, not configured)

The lambda layer declaration grows a `modules` field:

```ts
{ name: 'chromium-149', buildPath: '../layers/chromium-...zip', modules: ['@sparticuz/chromium'] }
```

Meaning: "this layer provides these packages at runtime." The AWS bundler derives
externals from it; the dev server ignores it (locally the package resolves from
node_modules and just runs). Externalization stops being bundler config and becomes
a consequence of environment-provided modules — only applied on AWS builds, which is
the goal.

> **Found bug/todo**: doccypoccy's pdf service *says* (in a comment) it externalizes
> `@sparticuz/chromium`, but nothing anywhere does — the only externals rule in the
> whole stack is `externals: [/aws-sdk/]` in `quidproquo-deploy-rspack`. It is being
> bundled today. The `modules` field fixes this properly.

### defineBackendBundleOptions — skinny, rarely used

Home for dependency-specific build declarations that aren't layer-related:
`ignoreModules` (adm-zip's `original-fs`, ws's `bufferutil`/`utf-8-validate`),
`ignoreWarnings` (liquidjs source-map noise), and an `externals` escape hatch for
non-layer cases. Lives in **quidproquo-core** — "these modules behave oddly at
build time / are provided by the environment" is platform-neutral metadata even
though layers are the AWS mechanism.

### defineFrontendBundleOptions — ships nearly empty

Fonts/images are already default-on in the views build. Grow on demand (extra asset
extensions, extra MF shared packages, html tweaks). Don't add speculative options.

### defineDevServerOptions({ port }) — exported from quidproquo-dev-server

Replaces the `"port": 3069` smuggled into views package.json. The package that
consumes the setting exports it, same pattern as AWS-only settings living in
quidproquo-config-aws. No `defineDevServerBundleOptions` for now — the dev server
runs from source with real node_modules, so bundling concerns dissolve there by
construction; add it only when a genuine dev-only build tweak appears.

All new enums follow the house style: TS `enum` with camelCase members.

## Per-app configuration

- **`deploy.config.json` stays JSON** (machine-readable before any TS executes —
  discovery, prompts, credential checks) and is **extended to own deploy identity**:
  environment name → account/region. `qpq go --env production` then needs no
  AWS_DEFAULT_ACCOUNT/AWS_DEFAULT_REGION/ENVIRONMENT env vars (account IDs are
  committed; ACTOR_NAME remains an env/flag detail). Prefix + domain stay here too.
- **`account.qpq.ts` / `bootstrap.qpq.ts` move from tools into each app**,
  parameterized by the values in deploy.config.json. One bootstrap/account config
  per app; bootstrap already namespaces deployed resources by app name, so multiple
  apps sharing an AWS account coexist.
- **Lifecycle hooks**: `apps/<app>/package.json` carries app-owned scripts with a
  `qpq:` prefix convention (`qpq:postinstall`, `qpq:prebuild`, ...) which the CLI
  invokes when present. chakra:typegen moves out of the root postinstall into
  docgen's own `qpq:postinstall`.

## Migration: slim doccypoccy into the lean reference project

Scaffolding (`qpq create app|service`, `npm create quidproquo`) and `qpq upgrade`
are day-two. Day one is making doccypoccy lean:

1. Add `modules` to the layer declaration type; derive externals in the AWS bundle
   path; declare `@sparticuz/chromium` on the chromium layer (fixes the found bug).
2. Add `defineBackendBundleOptions` / `defineFrontendBundleOptions` (core) and
   `defineDevServerOptions` (quidproquo-dev-server).
3. Move `tools/rspack` builders into `quidproquo-deploy-rspack`; strip the
   doccypoccy-specific ignore cruft and re-declare it via
   `defineBackendBundleOptions` in the relevant doccypoccy services.
4. Move `tools/dev-server` into `quidproquo-dev-server`; port config comes from
   `defineDevServerOptions`, delete `"port"` from views package.jsons.
5. Move the CDK entry + cdk.json into `quidproquo-deploy-awscdk`.
6. Create `quidproquo-scripts`: port `tools/services-deployment-awscdk/scripts/*`
   as `qpq` commands, calling down into the packages above.
7. Move account/bootstrap configs per-app; extend deploy.config.json with the
   env → account/region map; switch scripts off raw env vars.
8. Give each app a package.json; move chakra:typegen to docgen's `qpq:postinstall`.
9. Delete per-service `rspack.config.ts`; slim per-package tsconfigs to stubs.
10. Root package.json: thin `"go": "qpq go"`-style aliases; drop tools/ and the
    devDeps that only existed for it; delete `tools/`.

## Deferred / open

- dynamicModuleLoader ownership details when tools/dev-server merges into
  quidproquo-dev-server (some overlap already exists).
- publish / docker deploy flow specifics.
- validate-ts story once per-package tsconfigs are stubs.
- Port auto-assignment fallback when a service declares no defineDevServerOptions.
- The npm-link development workflow against quidproquo-scripts itself.
- Scaffolder (`npm create quidproquo`) and `qpq upgrade` codemods — day two.
