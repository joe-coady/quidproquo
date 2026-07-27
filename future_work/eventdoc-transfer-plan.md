# EventDoc transfer: reference walking + export/import bundles

## Repos

This lands across two repos and is not done until both are done.

| Repo | Path | Role |
|---|---|---|
| quidproquo | `~/repo/joe-coady/quidproquo` | The generic feature: `quidproquo-features/src/eventDoc` + new `eventDocTransfer` |
| doccypoccy | `~/repo/antero-software/doccypoccy` | First consumer: docgen template/content/layout/style definitions, config wiring, both screens |

doccypoccy consumes qpq as published `^0.1.11` deps with `npm run qpq:link` (or `qpq:update`)
to point them at the local checkout. So qpq changes are only visible in doccypoccy after
qpq is rebuilt and linked. **Do not run qpq builds unprompted**; list the commands and let
the user trigger them, since they consume these libs elsewhere.

Ignore `doccypoccy/packages/exengne/service-utils/dist/src/eventDoc/**`. It is a stale
vendored copy of an older eventDoc; there is no matching `src/`, and the live code imports
from `quidproquo-features`. Never edit it.

The shared packages ship NO React components (`quidproquo-features` has zero `.tsx`;
`quidproquo-web-react` is providers and hooks only). So the state module and stories are
shared in qpq, and the actual screens are built app-side in doccypoccy's views with
Chakra UI v3.

## Goal

Move a document and everything it depends on between running instances of the same app
(dev to UAT to prod) through a file. Two halves, useful independently:

1. **The reference manifest.** A doc type declares what it references; a generic walk
   follows those references recursively (cycle-safe) and returns every doc that has to
   travel with it. In docgen: a template references content, layouts and styles; content
   references styles; so exporting one template discovers the whole set.
2. **Export / import bundles.** Export builds one JSON file (event logs + asset bytes)
   for a manifest. Import reads it into another instance as a fast-forward of each doc's
   event log.

The app never knows about environments. Export writes a file, import reads one, and
where it goes is the operator's business.

## Why this is mostly assembly, not new machinery

Five properties the event-doc layer already has:

1. **The summary is fully derivable from the log.** `askEventDocCreate` and
   `askEventDocEventAppend` both build `EventDocSummary` by folding events through
   `createEventDocSummarySeed(type)` + `applyEventDocSummaryEvent`. So a bundle carries
   ONLY events and asset bytes; the summary is rebuilt on import. Nothing derived
   crosses, so there is no "imported a stale read model" failure mode.
2. **Event writes are conditional.** `askEventDocEventWrite` claims `{pk: docId, sk: index}`
   with `ifNotExists`. Writing a foreign event verbatim at its original index either lands
   or conflicts, which makes import idempotent and resumable for free.
3. **Assets are immutable and prefix-addressable.** `<docId>/assets/<guid>` via
   `eventDocAssetPath`. So "does the target already have this asset" is a presence check,
   and enumerating a doc's assets is one drive listing.
4. **`EventDocLink` is already the reference model.** `{ eventDocService, eventDocType, id, mode }`,
   and docgen already writes exactly these (`askTemplateSetLayoutLink`,
   `askTemplateAddStyleLink`, `askTemplateAddContentNode`, `askContentAddStyleLink`,
   `askTemplateTestSetTargetLink`). No new model.
5. **App code hooks in by registered inline-function name.** The generic routes ship in
   quidproquo-features and cannot know app doc types, which is why `eventValidator`,
   `eventRenderer`, `onPublish`, `onAppend` and `scopeResolver` are inline-function names
   resolved from route globals. The reference collector follows the same pattern.

## Decisions (settled 2026-07-26)

1. **File transport, not environment-to-environment networking.** Export produces a
   file; import consumes one. This deletes peer registries, machine users, cross-env
   secrets, egress rules, CORS (route and storage-drive), and the "prod must be able to
   reach UAT" requirement. It also works when prod is network-isolated, and the file is
   an artifact that can hang off a change ticket. The manifest is what makes this
   comfortable: a bundle is one template plus its dependencies, not a whole collection.

2. **No zip.** A bundle is one JSON object with asset bytes base64-inlined.
   `JSON.stringify` / `JSON.parse`, no dependency, no streaming, no entry paths. Built
   backend-side, written to a storage drive, and moved via presigned GET (download) and
   presigned PUT (upload), so no API payload limit is ever in the path.

3. **Ids are preserved, always.** `EventDocLink` targets an id, so preserved ids mean
   links keep resolving with zero payload rewriting, a doc keeps one identity across dev
   to UAT to prod, and re-import is a no-op. Guid collision across environments is not a
   real risk. No id remapping.

4. **Import is fast-forward only.** The target's log must be a prefix of the incoming
   log. Equal means up to date. Target ahead, or a prefix mismatch, is `diverged` and
   NOTHING is written for that doc. A hand-edit at the destination therefore surfaces as
   a divergence report rather than being clobbered or silently skipped.

5. **The manifest walk is an iterative worklist, not a QPQ context.** Contexts are
   immutable down the tree and must be serializable, so they cannot accumulate a visited
   set across sibling branches. One story, a worklist plus a visited array keyed
   `${service}:${type}:${id}`.

6. **References are collected at EVERY event, migrated to the latest shape.** (Revised
   2026-07-27; was "latest fold plus each published version's fold".) One pass through
   the log with `foldEventDocLogStep`, collecting after each step, deduped. Three reasons
   it is every event rather than the version boundaries:

   - An `EventDocLink` can pin a specific version or event index of its target, and a
     published render resolves links as of the moment it was published, so any past state
     may be rendered. A link that lived and died inside one version is reachable that way.
   - It is CHEAPER than what it replaced: the boundary version did N+1 full folds per doc
     (one per published version, each through its own inline-function call). This does one
     fold's worth of reducer steps plus a per-step migrate that no-ops whenever the log was
     authored at the current version.
   - The walk is naturally recursive and each doc is visited once, so a template at v1 can
     still discover a stylesheet through a content item.

   The migrate-to-latest is what makes `references` a SINGLE function per doc type written
   against the current view: a field rename (`contentList` -> `contents`) is covered by the
   migration that already had to exist, and no versioned collector map is needed. Two
   details in `collectEventDocReferences` that must not be "optimised" away: the
   accumulator stays at its natural version and a migrated COPY is collected from (feeding
   the migrated state back would hand a later v1 event's version-routed reducer a v2-shaped
   state), and collection runs on the latest shape so the collector sees exactly what a
   render sees. A migration that drops a concept therefore drops those links from the
   manifest too, which is correct: the renderer stops seeing them as well.

   Parked: an `onlyThisVersion` fast mode. It needs proper per-link resolution (a link's own
   Latest/Version/Exact mode against the referrer's publish time), not "same version
   everywhere", so it reuses render-time resolution and is a separate piece of work. Even
   then it would narrow DISCOVERY only: a discovered doc always transfers its whole log,
   because fast-forward needs it.

7. **Events are written verbatim, validators bypassed.** Original `index`, `createdAt`
   and `clientMessageId` (the sole exception is `createdBy.userId` - see 8).
   `askEventDocEventAppend` deliberately restamps metadata and validates, so it cannot
   reproduce a foreign event; import needs its own
   write path. Bypassing the validator is correct for replaying already-validated
   history (a validator that got stricter since must not rewrite the past).

8. **The actor id is localised to the importer; the display name is not.** (Revised
   2026-07-27; was "actors travel verbatim, no mapping".) Every imported event's
   `createdBy.userId` becomes the importing user's id, while `createdBy.userDisplayName`
   is kept from the source. The source id is guaranteed to resolve to nobody in the target
   directory - the one exception being two tenants of a single system - so carrying it over
   would leave a foreign key pointing at nothing. The display name is a denormalised
   snapshot that stays true wherever it is read. Net: the id answers "who put this here",
   the name still answers "who wrote it". The summary is folded from the localised log, so
   its `createdBy`/`updatedBy` are local too.

   Safe for the fast-forward comparison because event identity is (type, index, version,
   clientMessageId, createdAt) and deliberately excludes the actor, so exporting from the
   target and importing it back still fast-forwards rather than looking diverged. The
   original decision rested partly on a belief that rewriting the actor WOULD break that
   comparison. It does not.

9. **Hooks fire once per doc, at the end.** `onPublish` for the latest publish event,
   then `onAppend` for the tail, after the whole log is written. Per-event firing would
   be slow and would spam the target's websockets. Both hooks are already documented as
   needing to be idempotent.

10. **Mounted per service.** `defineEventDocTransfer({ collections })` goes next to the
    `defineEventDoc` calls, in the service that owns those stores, and the app feeds both
    from one collection array so they cannot drift. A reference pointing into another
    service fails loudly with the offending refs listed; docgen's template manifest lives
    entirely in the template service.

## Shape

### The two layers of "references"

```ts
// 1. On the definition, next to fold. Pure, per doc type, trivially testable.
createEventDocDefinition({
  ...,
  references: (view: TemplateView) => EventDocLink[],
})

// 2. Per collection, the generic seam (same shape as eventRenderer).
defineTenantedEventDoc({ ..., referenceResolver: TEMPLATE_REFERENCES_FN })

// The registered inline function is a three-line adapter:
//   definition.references(definition.fold(events))
// plus the per-published-version union (decision 6).
```

### Bundle

```ts
type EventDocBundle = {
  formatVersion: number;
  source: { application: string; environment: string; exportedAt: QpqIsoDateTime };
  docs: {
    service: string;
    type: string;
    id: string;
    events: EventDocEvent[];
    assets: { guid: string; data: QPQBinaryData }[]; // QPQBinaryData = base64Data + filename + mimetype
  }[];
};
```

### Routes

| Route | Side | Purpose |
|---|---|---|
| `GET {basePath}/{id}/references` | source | The doc's references, ONE hop out (debugging a collector in isolation) |
| `GET {basePath}/{id}/assets` | source | List a doc's asset guids (the one missing read) |
| `POST /transfer/manifest` | source | The recursive manifest (picked docs + everything they pull in), for the export dialog's list |
| `POST /transfer/export` | source | Build the manifest, build the bundle, write to drive, return presigned GET + the manifest |
| `POST /transfer/upload` | target | Presigned PUT + transferId |
| `POST /transfer/plan` | target | Bundle source + per-doc classification, writes nothing |
| `POST /transfer/import` | target | Apply, reporting the same rows |

The recursive walk lives in the transfer feature, not on the collection route: only that layer
holds the registry that maps a link's `(service, type)` to a collection.

`/transfer` is its own base path at the api root: nothing may mount a literal under a collection's
`basePath`, because `{id}` matches any single segment. It sits alongside the collection roots, so
nothing may declare a collection at `/transfer` either.

Both environments run the same code, so every route exists everywhere; which ones get
used depends on which end you are standing at. `(service, type)` is identical across
environments by construction, so there is no manifest mapping step; a renamed collection
404s loudly, which is the correct outcome.

### Plan classification

| Condition | Status |
|---|---|
| not in target | `new` |
| target log is a prefix of incoming | `fast-forward (+N)` |
| logs identical | `same` |
| target ahead, or prefix mismatch | `diverged` (blocking) |
| same `code`, different id | `code-conflict` (blocking) |
| deleted at source | `ignored` |

A diverged row can be overwritten on request (`force` on the import): the target's divergent tail is
written to `discarded/<transferId>/<docId>.json` on the transfer drive and THEN deleted, so the doc
becomes a clean fast-forward and the discarded events stay recoverable. Two clicks in the UI, with
the warning that matters: it rewrites published version history, so renders already produced from
those versions stop being reproducible. Force never applies to a code conflict - a different doc owns
that code, so discarding this one's tail fixes nothing.

`code-conflict` is separate from divergence because `askEventDocGetByCode` treats code as
a lookup key, so a collision breaks lookups even when the logs are fine.

### Flow

- **Source:** Export button on the template screen, dialog lists the manifest grouped by
  type ("content: a, b, c / style: x, y, z / layouts: g"), confirm, browser downloads
  `<type>-<code>-<timestamp>.json`.
- **Target:** Import button on any collection list, dialog: pick file, upload, plan table, confirm,
  result. It sits on the LIST rather than one privileged screen because the bundle decides which
  collections it writes to, not the screen you launched it from.

## qpq changes

1. **Definition + models.** `references?: (view: TView) => EventDocLink[]` on
   `EventDocSavedDefinitionConfig`; `EventDocReferencesInput` (`{ events, docId }`,
   mirroring `EventDocRenderInput`); `EventDocManifestItem`
   (`{ service, type, id, code, name, depth }`).
2. **Collection wiring.** `referenceResolver?: string` on `EventDocRoutesOptions`, through
   `buildEventDocStore`, `EventDocStore`, `buildEventDocStoreGlobals`, and a
   `EVENT_DOC_REFERENCE_RESOLVER_GLOBAL` constant.
3. **`askEventDocReferences(docId)`** in `eventDoc/logic/`: invoke the collection's
   resolver over the doc's full log, return `EventDocLink[]`.
4. **`GET {basePath}/{id}/assets`** controller + `askEventDocListAssets(docId)` data fn
   (drive listing under `<docId>/assets/`, scope-aware).
5. **New `eventDocTransfer/` module** in quidproquo-features:
   - `config/defineEventDocTransfer` (collection registry + the `/transfer` routes)
   - `logic/askEventDocManifest` (worklist + visited, cross-service refs throw)
   - `logic/askEventDocBundleBuild`, `askEventDocBundlePlan`, `askEventDocBundleApply`
   - `logic/askEventDocWriteForeignEvents` (verbatim writes, summary rebuild by folding,
     hooks once)
   - `logic/findEventDocLogDivergence` (pure, unit tested on its own)
   - `models/`, `routes/controllers/`, and the state module for both screens
     (`effects/`, `actionCreators/`, `stateUpdaters/`, `selectors/`, `transport/`),
     following the state-module layout. No components: qpq ships none.
6. **Import ordering:** leaves first (reverse discovery depth), so a partial import never
   leaves a referrer pointing at a doc that is not there yet.
7. **A collection with no `referenceResolver` is a leaf.** Layouts and stylesheets declare
   nothing and the walk stops there; no empty-hook boilerplate needed.

## doccypoccy

All of this is in `apps/docgen/services/template`, which owns the whole template manifest.
(client-access has its own event docs, `tenant` and `appClient`; out of scope.)

### 1. `references` per doc type

Definitions live at `shared-logic/src/modules/<module>/<module>EventDoc.ts`, with versioned
state under `<module>/v1/`. Add a `references` function per doc type in its own file
(`<module>/v1/<module>References.ts`) and wire it into the `createEventDocDefinition` call.
The link-bearing fields already exist:

| Doc type | Module | Links to collect |
|---|---|---|
| template | `template` | `TemplateState.layoutLink` (`Nullable<EventDocLink>`), `TemplateState.styleLinks` (`EventDocLink[]`), and each `TemplateNode.contentLink` in `nodes` |
| content item | `contentItem` | `ContentItemState.styleLinks` (`EventDocLink[]`) |
| template test | `templateTest` | `TemplateTestState.targetLink` (`Nullable<EventDocLink>`) |
| layout | `layout` | none, leaf: declare nothing |
| stylesheet | `styleSheet` | none, leaf: declare nothing |
| render group | `renderGroup` | no `EventDocLink` fields; leave alone this pass |

So the recursion that matters is template to content to style, plus template to layout and
template to style directly. The `templateTest` hook is cheap to add at the same time.

### 2. Reference resolver inline functions

Same pattern as the existing renderers:

- Entry file per collection at `service/src/entry/inlineFunction/<name>.ts`, exporting a
  function of the same name (siblings: `renderTemplate.ts`, `renderContent.ts`,
  `renderLayout.ts`, `renderStyle.ts`, `validateTransformerEvent.ts`).
- Body is the three-line adapter: fold the log with the module's definition, call its
  `references`, union across published versions.
- FN name constant in `config/src/index.ts` alongside `TEMPLATE_RENDERER_FN` etc.
- Registered in `service/src/infrastructure.ts`:
  `defineInlineFunction('/entry/inlineFunction/templateReferences::templateReferences', { functionName: TEMPLATE_REFERENCES_FN })`,
  then passed as `referenceResolver: TEMPLATE_REFERENCES_FN` on that collection's
  `defineTenantedEventDoc`.

### 3. Collection array as the single source of truth

`service/src/infrastructure.ts` currently calls `defineTenantedEventDoc` once per
collection. Hoist those option objects into one `COLLECTIONS` array, map it for the
`defineTenantedEventDoc` calls, and pass the same array to `defineEventDocTransfer`. The
`.map(...)` result goes in as a plain element, never a spread: qpq flattens nested config
arrays recursively.

### 4. Screens (app-side, Chakra)

- **Export**: button on the template screen in `views/src/modules/templateEditor`, opening
  a dialog that calls `GET /templates/{id}/references`, groups the result by
  `eventDocType` with display labels, and on confirm calls `POST /transfer/export` and
  downloads the presigned URL. (`views/src/modules/eventDocList` is the alternative home
  if a per-row export reads better.)
- **Import**: new `views/src/modules/eventDocTransfer` module: file picker, upload, plan
  table, confirm, result. Both drive the shared state module from
  `quidproquo-features/src/eventDocTransfer`.

## Known limits, accepted

- **Soft delete does not travel.** `askEventDocSoftDelete` writes `deletedAt` on the
  summary, not the log, so an events-only bundle cannot express it. Deleted docs are
  skipped and reported as `ignored`. (Making delete an event would fix this properly and
  is worth considering separately.)
- **Deploy code before importing.** Events carrying a `schemaVersion` newer than the
  target deployment's reducers import fine and then fail to fold on the client. The plan
  step can compare the max incoming `schemaVersion` against the target's definitions and
  refuse; do this if it bites.
- **Scope is per transfer.** Everything is scope-partitioned and links carry no scope, so
  one bundle stays inside one tenant. The exporting request's scope is the source; the
  operator picks the target tenant at import.
- **Cross-service manifests throw.** Deliberate: the export runs in the service that owns
  the stores, and cannot read a sibling service's. Revisit only when a real manifest
  crosses.
- **Bundle size is bounded by a lambda invocation.** Fine for a targeted manifest. A
  single doc or asset that cannot fit is the signal to add chunking, not now.

## Not doing (yet)

- **Backend-to-backend environment sync** (target logs into a peer, pulls, writes). Was
  the leading design for a while; the file version deletes peer registries, machine
  users, cross-env secrets and networking entirely, and the live cross-environment diff
  view was the only real thing lost. Revisit only if the two-step human handoff becomes
  the bottleneck.
- **CLI-driven transfer.** Ruled out: this is an in-app operation, no terminal.
- **Zip, manifests, capabilities handshakes, queue-driven jobs, websocket progress,
  sync-run records.** All were on the table; the manifest making bundles small and
  targeted removed the need for every one of them.
- **Published-only / flattened export** (drop the draft tail, ship one snapshot event).
  Needs a `toSnapshotEvents(view)` hook per doc type. Full history costs nothing extra
  and is exact.
- **A restore route for overwrite backups.** `discarded/<transferId>/<docId>.json` holds the exact
  events a forced overwrite threw away, written before anything is deleted, so nothing is lost - but
  putting them back is manual today (assemble the surviving prefix + the backup into a bundle and
  force-import it). `POST /transfer/restore { transferId, docId }` would be the two existing halves
  wired in reverse: truncate back to `discardedFromIndex`, then write the backed-up events in. It
  would need its own transferId so its own backup does not clobber the one it is reading.
- **Lifecycle rules on the transfer drive.** Nothing on `edoctransfer` expires today, and bundles
  carry base64 asset bytes (~400KB each in doccypoccy already). `exports/` and `imports/` are pure
  scratch and want an expiry; `discarded/` wants keeping for a long time, or forever.
- **Id remapping** (for cloning inside one environment). Would need a generic deep
  rewrite of link-shaped payload objects plus asset prefix rewriting. The format does not
  block it.

## Tasks

### qpq (`~/repo/joe-coady/quidproquo`)

- [x] `references` on the definition config + `EventDocReferencesInput` +
      `EventDocManifestItem` models
- [x] `referenceResolver` through routes options / `EventDocStore` / `buildEventDocStore` /
      `buildEventDocStoreGlobals` + `askEventDocReferences` + specs
- [x] `askEventDocManifest` (worklist, cycle-safe, published-version union, no-resolver
      means leaf, cross-service throw) + diamond/cycle specs
- [x] `GET {basePath}/{id}/references` + `GET {basePath}/{id}/assets` routes +
      `askEventDocListAssets`
- [x] bundle models + `askEventDocBundleBuild` + `defineEventDocTransfer` +
      `POST /transfer/export`
- [x] `findEventDocLogDivergence` (pure) + `askEventDocBundlePlan` +
      `POST /transfer/upload` and `/transfer/plan`
- [x] `askEventDocWriteForeignEvents` (verbatim + summary rebuild + hooks once) +
      `askEventDocBundleApply` (leaves first) + `POST /transfer/import`
- [x] round-trip spec in the style of `eventDocScopedRoundTrip.test.ts` (build in one store
      context, apply into another, definition `fold` matches both sides, second apply is a
      no-op)
- [x] `eventDocTransfer` state module (effects / actionCreators / stateUpdaters / selectors
      / transport) for the export dialog and import screen. No components.
- [x] hand the user the build + link commands so doccypoccy can see the
      changes (do not run qpq builds unprompted)

### doccypoccy (`~/repo/antero-software/doccypoccy`)

- [x] `references` + wiring on the `template` definition (`layoutLink`, `styleLinks`,
      `nodes[].contentLink`), one file per module under `<module>/v1/`
- [x] `references` on `contentItem` (`styleLinks`) and `templateTest` (`targetLink`);
      `layout` and `styleSheet` stay leaves with nothing declared
- [x] reference resolver inline function per collection under
      `service/src/entry/inlineFunction/`, FN name constants in `config/src/index.ts`,
      registered in `infrastructure.ts` and passed as `referenceResolver`
- [x] hoist the `defineTenantedEventDoc` options into one `COLLECTIONS` array, map it, and
      feed the same array to `defineEventDocTransfer` (plain element, not a spread)
- [x] Export button + grouped manifest dialog on the template screen
      (`views/src/modules/templateEditor`)
- [x] Import dialog (`views/src/modules/eventDocTransfer`), launched from the collection list: upload, plan table, confirm,
      result
- [ ] verify in the running app: export a template with content + styles + a layout, import
      into a second instance, confirm the folded state matches and a second import is a
      no-op

## What landed (2026-07-26)

Everything above except the last task. Verified: qpq `npx eslint src` clean, `tsc --noEmit` clean,
`vitest run` 409 passing (15 of them new); doccypoccy `npm run validate-ts` clean across every
workspace (`check:circular` included) and `eslint` clean on the touched service.

Deviations from the plan as written, all recorded above:

1. **Two reference routes, not one.** `GET {basePath}/{id}/references` returns ONE hop (it is the
   collection's own read, and the natural place to debug a collector); the recursive manifest is
   `POST /transfer/manifest`, because only the transfer layer holds the registry that resolves a
   link's `(service, type)` to a collection. The export dialog calls the latter.
2. **Import is a dialog on the collection list**, not a standalone shell module: no federation
   config or navigation work, and it lands where someone would look for it.
3. **A bundle asset is `{ guid, data: QPQBinaryData }`.** `QPQBinaryData` already IS
   base64 + filename + mimetype, and it is what `askFileReadBinaryContents` returns and
   `askFileWriteBinaryContents` takes, so export/import needed no base64 conversion code at all.
4. **`/transfer/plan` returns `{ source, rows }`**, so the review screen can say which environment
   the file came from without a second call.
5. **`EventDocTransferStatus.Ignored` is for an empty incoming log**, not for a soft-deleted doc.
   Folding events can never produce `deletedAt` (soft delete writes the summary only), so the
   deleted check belongs at export time: the manifest walk marks `deleted` on the item, reports it in
   the dialog, does not walk into it, and leaves it out of the bundle.
6. **doccypoccy registers five collections, not seven.** Render groups are per-environment OUTPUT
   (rendered pdfs), and nothing builds an EventDocLink to a transformer yet. Reasoning is in
   `templateEventDocCollections.ts`.

Not done, and it needs a human: **the in-app dev-to-uat round trip**. What stands in for it is
`eventDocTransferRoundTrip.test.ts`, which drives the real controllers across two isolated
in-memory environments and asserts the folded state matches, a second import is a no-op, a
behind-target fast-forwards, a hand-edited target is refused, and a code collision blocks while the
rest of the manifest still lands.

**Local wiring caveat:** doccypoccy consumes qpq at `^0.1.11` from the registry, and the global npm
links are stale 0.1.10 copies, so `npm run qpq:link` would REGRESS it. To typecheck doccypoccy
against this work, `quidproquo-features/lib` was built and rsynced into
`doccypoccy/node_modules/quidproquo-features/lib`. That is a local shim: publish a qpq bump (or
refresh the global links) before relying on it, and any `npm install` in doccypoccy undoes it.
