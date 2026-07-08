# Federated code — consumer usage

Build a qpq service's story code as a module-federation remote and publish it into a
shared storage-drive bucket, so its lambda "shells" federate the code in at runtime
instead of running only what's bundled into their zips.

**Opt-in and fall-back-safe.** A service participates only if it declares
`defineFederatedModuleStore(...)`. Until artifacts are published for it, its lambdas
run the bundled code exactly as before. Publish nothing → nothing changes.

## The bucket: one shared storage drive

One service owns a storage drive; every service shares it via `owner`, and each
service's artifacts live under its own prefix (`s3://<bucket>/<service>/...`).

```ts
// in the owning service (e.g. shell):
defineStorageDrive('artifacts');
defineFederatedModuleStore('artifacts');

// in every other service:
defineStorageDrive('artifacts', { owner: { module: 'shell' } });   // grants read access
defineFederatedModuleStore('artifacts');                            // opt in, same drive
```

At deploy, `Function.ts` resolves that drive's bucket and points every lambda at
`s3://<bucket>/<service>`. Read access comes from the storage drive's own IAM grants —
no dedicated bucket or policy is created by federation.

## The pieces (all in the framework)

- `getRspackConfigForQpqRemote(qpqConfig, buildPath)` — `quidproquo-deploy-rspack`, or
  `getWebpackConfigForQpqRemote(qpqConfig, buildPath)` — `quidproquo-deploy-webpack`.
  Builds the service as an MF remote container. Append your own `module.rules`
  (e.g. `builtin:swc-loader` for rspack, ts-loader for webpack) before running it.
- `publishFederatedRemote(qpqConfig, buildPath, publishPath)` — both deploy packages.
  Lays out the content-hash version dir + `manifest.json` (written last). Returns the manifest.
- `defineFederatedModuleStore(storageDrive)` / `defineStorageDrive(...)` — `quidproquo-core`.
- The lambda loader (`loadFederatedStory`) reads `<prefix>/manifest.json`, syncs the
  version dir to `/tmp`, and loads stories via the MF runtime.

## Build + publish flow

```ts
const config = getRspackConfigForQpqRemote(qpqConfig, remoteBuildPath); // or getWebpackConfigForQpqRemote
config.module.rules.push(/* your builtin:swc-loader / ts-loader rule */);
await runRspack(config); // or webpack(config, cb)

const manifest = publishFederatedRemote(qpqConfig, remoteBuildPath, publishPath);
// publishPath/<hash>/remoteEntry.js + chunks
// publishPath/manifest.json
```

Then copy into the bucket under the service prefix — **version dir first, manifest last**:

```bash
aws s3 sync published/<hash>/       s3://<bucket>/<service>/<hash>/
aws s3 cp   published/manifest.json s3://<bucket>/<service>/manifest.json
```

New lambda cold starts pick up the version; a warm shell that started against an
empty store re-probes and picks up the *first* publish within ~60s. Later updates are
picked up on the next cold start. Rollback = re-upload a previous `manifest.json`.

## How a story resolves at runtime

1. `dynamicModuleLoader(runtime)` calls `loadFederatedStory(qpqConfig, runtime)`.
2. First resolve per container: read `<service>/manifest.json` from the store, sync the
   version dir to `/tmp` (atomic temp-then-rename), require the container, register it
   with the MF runtime (host provides `quidproquo-core`/`quidproquo-webserver` as shared
   singletons — one list drives both host and remote so they can't drift).
3. Look up `getFederatedKeyFromQpqFunctionRuntime(runtime)` in `manifest.exposes` — a
   **machine-independent** key (relative path, never an absolute `basePath`), so a remote
   published from a different machine than the shell was built on still matches.
4. `loadRemote('<container>/<exposePath>')`, return `module[storyName]`.
5. Any miss — no store, nothing published, runtime not in the manifest, export missing —
   returns `undefined` and the bundled module runs. A real S3 error (e.g. AccessDenied)
   is surfaced/retried with backoff, not silently treated as "not published".

## Options

`defineFederatedModuleStore(storageDrive, options)`:
- `recheckMs` — how often a warm lambda re-checks for a new published version (default
  60000). Set low (e.g. `5000`) while testing to see changes fast; raise for production.
- `bundleFallback` — `true` (default) also bundles the story code into the zip, so an
  empty store falls back to it. `false` = **thin shell**: no story code in the zip, the
  service runs ONLY federated code, and an unpublished store fails fast. Thin shells must
  be published before they work.

## Notes

- Pinned `@module-federation/enhanced@0.18.2` (+ `@module-federation/node@2.7.13` for the
  build) on both host and remote. A deploy-time version gate is still TODO.
- Edge (Lambda@Edge) lambdas can't take env vars, so they never federate — they run
  bundled code. Federation targets the api-phase lambdas.
- S3 reads pass `ExpectedBucketOwner`, so a same-named bucket in another account can't be
  used to inject code.
