# EventDoc: sortable event ids, and delete as an event

Status: the framework changes are DONE. The data migration is not.

The code in this repo now uses sortable ids and treats delete/restore as events. What has
not happened is moving any existing data: the new event tables are declared and empty, the
legacy ones are declared and untouched, and nothing copies between them yet. Deployed
environments will therefore start new documents on the new table and leave old documents
stranded on the old one until section 3 is carried out.

Two changes that belong together, because both exist to make the event log the only
authoritative thing and every read model a disposable projection of it.

1. Replace the contiguous integer event index with a coordination-free sortable id
   (UUIDv7), so appending needs no allocator and no coordination at all.
2. Make soft delete and restore reserved events, so `deletedAt` stops being state that
   lives only on a projection.

Both require a data migration. The first requires a new table per collection, because
DynamoDB key schemas are immutable.

## Why

The append path currently has to allocate a contiguous index, which means coordination:
either read the tail (contended, was the original design) or maintain an atomic counter
somewhere (an allocator, which has to live on some record and therefore makes that record
authoritative rather than derived).

A sortable id removes the question. Two writers never need to agree on anything, the append
becomes one write, and no read model holds anything that cannot be rebuilt from the log.

The same argument applies to `deletedAt`. Today soft delete writes it straight onto the
summary row, so rebuilding that projection from the log would resurrect deleted documents.
Deletion is a fact about the document and belongs in its history.

## 1. Sortable event ids

### The id

Use the existing `askNewSortableGuid` action. It is already implemented as UUIDv7
(`quidproquo-actionprocessor-js/src/actionProcessor/core/guid/getGuidNewSortableActionProcessor.ts`,
via the `uuidv7` package), and the js core processors compose into the node and awslambda
runtimes, so it is available everywhere the append runs.

UUIDv7 is a 48-bit millisecond timestamp followed by random bits, and its canonical string
form sorts lexicographically in timestamp order. No new dependency, and no purity problem:
id generation is already an action, so story replay stays deterministic.

Two appends landing in the same millisecond get an arbitrary but **stable** relative order.
That is consistent with the fold's validity invariant, which depends on stored order, and
stored order never changes once written.

### Type changes

All number to string:

| Where | Field | Renamed to |
|---|---|---|
| `EventDocEvent` | `payload.metadata.index` | `payload.metadata.eventId` |
| `EventDocVersion` | `eventIndex` | `eventId` |
| `EventDocLink` | the `Exact` variant's `eventIndex` | `eventId` |
| `askEventDocEventList` | `afterIndex` option | `afterEventId` |
| `EventDocStoredEvent` | `sk` | unchanged |
| `defineEventDocSummary` | `kvsKey('sk', 'number')` | `kvsKey('sk', 'string')` |

The rename went in at the same time deliberately. The field name is PERSISTED: an event is
stored as `{ pk, sk, data: event }`, so `index` is a literal attribute name inside every
stored event. Renaming normally means a data migration all of its own; doing it here is free,
because the sort-key change already forces one and the copy has to rewrite every event
anyway. `index` had also stopped being true: it indexes nothing and arithmetic on it is
meaningless.

`afterEventId` is also an HTTP query parameter name on the list-events route, so front and
back end deploy together.

Every comparison on these is `<=` or `>`: the version cutoff in
`askEventDocPublishedVersionAsOf`, and the `kvsGreaterThan('sk', afterIndex)` range query in
`askEventDocEventList`. Both are correct on lexicographically sortable strings, so no
comparison logic changes.

`EventDocLinkMode.Exact` is declared but used nowhere in the framework or in DocGen, so no
stored link references need migrating. Only the type changes.

### What this deletes

- The whole allocator concept: `askEventDocClaimEventIndex`, `EventDocSummary.nextEventIndex`,
  and the sentinel-item alternative
- `resolveEventDocSummaryHead`, which only existed to derive the open draft's head from the
  allocator at read time
- The lazy-seed migration for documents predating the allocator
- `nextIndexAfter` in `askEventDocWriteForeignEvents`, so imports become trivially safe:
  foreign events keep their own ids and nothing has to be renumbered
- One of the append's two writes

The append becomes: generate id, write event. That is the entire write path.

## 2. Delete and restore as reserved events

### New effects

`EventDocEffect` gains `Delete = 'DELETE'` and `Restore = 'RESTORE'`, alongside `InitState`,
`SetCode`, `SetName`, `CreateDraft` and `Publish`.

### Reducers

- `eventDocSummaryReducer` gains handlers setting and clearing `deletedAt`, so the projected
  record derives it like everything else.
- `buildEventDocBaseReducer` gains the same, so `foldEventDocBase` and every collection fold
  see deletion in the folded document state.

### Validators

`reservedEventDocEventValidators` currently reads:

```
InitState   → forbidInit
CreateDraft → requirePublished
Publish     → requireDraft
'*'         → requireDraft
```

Deletion cuts across the publish lifecycle, so it needs explicit entries rather than falling
through to `'*'`:

- `Delete` must be allowed on a published document, so it cannot inherit `requireDraft`. Rule
  is `requireNotDeleted` (deleting twice is a no-op that should not be recorded).
- DELETE and RESTORE carry the CALLER's schema version, like every other event, rather than
  pinning one. The fold's version-monotonicity rule applies to them the same as to an edit,
  so there is nothing safe to default to: guessing 1 would silently produce an event the fold
  ignores on any document past v1. INIT_STATE remains the only event that pins its own
  version, because it is the one that opens the log. The route takes it as
  `?schemaVersion=N` and rejects a request without it.
- `Restore` requires the document to be deleted.
- The `'*'` fallback becomes "draft **and** not deleted", so a deleted document rejects edits
  until it is restored.

Worth deciding explicitly: whether `Publish` and `CreateDraft` are allowed on a deleted
document. Recommendation is no, on the same reasoning as edits.

### Call sites

- `askEventDocSoftDelete` stops writing to the store and appends a `DELETE` event.
- A new `askEventDocRestore` appends `RESTORE`.
- `askEventDocList`'s `includeDeleted` filter is unchanged: it still reads the projected
  `deletedAt`, which is now derived rather than directly written.

## 3. The migration

### The table

`sk` changes from number to string, and a DynamoDB key schema cannot be altered in place. So
every event-doc collection needs a new events table and a copy. Across both apps that is:
flow, flowTest, flowDataset, flowInstance, flowExperiment, template, renderGroups,
client-access, tenant, admin session, and maintenance.

### Deriving ids rather than generating them

For each event, build its UUIDv7 from the event's own `createdAt` as the timestamp component
and its original numeric index in the entropy region, and write it to the renamed `eventId`
field. The copy therefore does two things per event: mint the id, and rename the field.

This is worth doing rather than calling `askNewSortableGuid` during the copy, because it
gives three properties at once:

- Original ordering is preserved exactly, including for events sharing a millisecond, since
  the original index breaks the tie.
- Ids are temporally honest, rather than every historical event appearing to have been
  written at migration time.
- The migration is deterministic, so it is re-runnable and its output is verifiable.

### Deleted documents

Every summary row currently carrying `deletedAt` needs a `DELETE` event appended to its log,
with the event's timestamp taken from the existing `deletedAt`. Derived ids then sort it
after the document's last real event, which is correct.

### Projections

Summary rows need rebuilding after the copy, but they do not need migrating, which is the
point of the exercise. Once the stream projector exists (see the separate streams work), a
rebuild is just replaying the log.

## 4. Sequencing

1. ~~Fold-time validation.~~ Done.
2. ~~Sortable ids in the framework, plus delete and restore as events.~~ Done.
3. The stream projector, so summaries are rebuilt from the log rather than by the writer.
   In progress: core, the AWS action processors and the CDK constructs exist; the dev server
   emulation and the projector itself do not.
4. Migration tooling, then the per-collection table copy and cutover. Not started.
5. DocGen picks up the new framework. Not started.

Step 3 must land before any deployed environment is cut over. Step 2 was the writer's last
excuse for maintaining the summary, and the projector is what replaces it: until then,
`askEventDocEventAppend` still calls `askEventDocSummaryRederive`, which is the one piece of
read-model maintenance left on the write path.

## 5. What landed alongside

Two things fell out of the sortable-id change that were not obvious up front:

- **Workspace renumbering is gone.** Pending events used to be re-stamped with sequential
  provisional indexes (`renumberWorkspaceEvents`) so they continued the saved log. Ids are
  coordination-free, so the client now mints a real one at commit time and it already sorts
  after the saved log. The helper and its three call sites are deleted.
- **A latent bug in `askEventDocTransferTruncateLog`.** It compared `metadata.index >=
  fromIndex`, but `fromIndex` is a POSITION in the log (what `findEventDocLogDivergence`
  reports and what `askEventDocWriteForeignEvents` slices on), not an event id. Those
  coincided while ids were a contiguous counter and stopped coinciding here. It slices by
  position now.

## 6. Open questions

- Whether `Publish` and `CreateDraft` should be rejected on a deleted document.
- Whether the migration runs as a QPQ migration entry or a standalone script. Standalone is
  probably better given it is a table-to-table copy with a cutover, not an in-place change.
- Whether old events tables are retained after cutover, and for how long. Retaining them is
  the cheap insurance and they can be dropped once a rebuilt projection has been verified.
- Whether hard delete (as opposed to soft) needs an equivalent story, or stays out of the
  event model entirely.
