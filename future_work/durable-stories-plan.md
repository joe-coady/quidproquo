# Durable Stories Plan: suspend, hop, and resume stories across lambda invocations

## Goal

A story should be able to outlive the process that started it:

- **Hop**: a long-running story approaching the lambda deadline (say 5 of the 15 minutes used,
  or whatever threshold we pick) checkpoints at the next action boundary and continues on a
  fresh lambda invocation. The 15 minute limit stops being a wall.
- **Wait for a resume**: `askWaitForResume(token)` suspends the story entirely (no compute
  billed) until something outside presents the token, e.g. a user clicking a link in a verify
  email. The click's payload becomes the action's return value.
- **Live logs**: history entries stream out as actions start and finish, so qpq-admin can show
  a story's log *while it runs*, including "action X started 40s ago, still going".

All three are the same mechanism. The action log IS the durable execution state.

Deliberately out of scope for now: `askSleep(days(30))` and `askWaitForEvent('invoice-paid')`.
Both are natural extensions of the same suspension machinery and are parked in Later; nothing
in this plan blocks them.

## Why this is nearly free in QPQ

Three properties the runtime already has:

1. **The story loop is checkpointable by construction.** `resolveStory` yields an action,
   processes it, pushes `{act, res, startedAt, finishedAt}` onto `history`, and feeds the result
   back into the generator. All story state between actions is reproducible from
   `(story, input, history)`. There is nothing else to save: no stack snapshots, no serialized
   closures.

2. **Replay already exists.** `qpqExecuteLog` runs a story with a Proxy processor that answers
   every action from `history[logIndex++]`. Resuming is replay that *keeps going*: once history
   is exhausted, fall through to the real processors.

3. **Determinism is enforced by the framework, not by discipline.** Time (`date`), guids
   (`guid`), and randomness (`math`) are actions, so they replay from history. Story code between
   yields is pure by convention. Replaying a partial log lands the generator in exactly the state
   it was in at suspension. (Temporal-style platforms make users learn "workflow determinism
   rules"; we get them from the action model.)

The one missing primitive: logs ship **once, at story end** (`resolveStoryWithLogs` calls
`logger.log(storyResult)` after `resolveStory` returns, and the S3 logger writes a single
`<correlation>.json`). Everything below hangs off making history emission incremental.

## Mechanism

### 1. Incremental history emission (core)

`resolveStory` gains an optional `storyProgressListener` (threaded the same way `logger` is):

```ts
interface StoryProgressListener {
  onActionStarted(entry: { act: Action<any>; startedAt: string; index: number }): void;
  onActionCompleted(entry: StoryResultHistoryEntry, index: number): void;
}
```

- `onActionStarted` fires before `processAction`, `onActionCompleted` after. Both are
  fire-and-forget from the loop's perspective (listener buffers and flushes async, same pattern
  as the buffered S3 logger).
- The final `logger.log(storyResult)` stays as-is. The complete `<correlation>.json` remains the
  permanent record; incremental entries are a live feed plus checkpoint material, compacted away
  on completion.

### 2. Checkpoints

A checkpoint is a `StoryResult` that isn't finished:

```ts
interface StoryCheckpoint {
  correlation: string;
  storyEntryPoint: QpqFunctionRuntime;   // how to re-load the story function
  runtimeType: QpqRuntimeType;
  input: any[];
  session: StorySession;
  history: StoryResultHistoryEntry[];
  logs: qpqConsoleLog[];                 // console output so far, merged on resume
  suspension: HopSuspension | WaitForResumeSuspension;
  configHash: string;                    // detect code/config drift between suspend and resume
  resumeCount: number;
}
```

Stored in the logs drive next to final logs: `checkpoints/<correlation>.json`. Deleted (and the
final compacted log written) when the story completes.

### 3. The hybrid resume processor (core)

Generalize `createDebugLogActionProcessor`:

```ts
createResumeActionProcessor(checkpoint, realProcessors)
// actions 0..history.length-1  -> answered from history (instant)
// the suspended action          -> answered from the suspension payload (see below)
// everything after              -> delegated to realProcessors
```

This is the whole resume story. It also happens to be the fork-replay primitive from
trace-replay work (replay N, then go live), so it belongs in core, not in the lambda package.

### 4. Suspension signalling (core)

A processor signals suspension by returning a new `ActionResultType.Suspend` variant carrying
the suspension descriptor. The `resolveStory` loop, on seeing it:

1. does NOT push a completed history entry and does NOT advance the generator,
2. hands the checkpoint (history so far + suspension descriptor) to the platform's
   checkpoint writer,
3. returns a `StoryResult` tagged `suspended` (so callers and the logger know this run is a
   segment, not a completion).

On resume, the suspended action is the first live one. The hybrid processor answers it directly
from the suspension payload (the resume click's payload, or a timed-out result) rather than
re-running the processor, so a wait never "re-waits".

### 5. The deadline hop (all platforms)

The hop policy lives in core; platforms only supply the deadline. On lambda the handler knows it
from `context.getRemainingTimeInMillis`. On the dev server each story gets a *synthetic*
deadline equal to whatever the deployed lambda for that runtime type would get, so a story that
hops at ~5 minutes in AWS hops at ~5 minutes locally too. Same code path, same threshold; only
the source of the number differs.

Prereq for that parity: per-runtime-type timeouts are currently hardcoded inside the CDK
constructs (`Function.ts` defaults to 25s; queue/event/schedule constructs pass their own).
Lift those numbers into a shared definition that both `quidproquo-deploy-awscdk` and
`quidproquo-dev-server` read, so "how long does this kind of handler get" has one source of
truth.

Thread a `shouldSuspend(): boolean` into the runtime; `resolveStory` checks it once per loop
iteration, immediately after an action completes (its entry pushed to history, its result not
yet fed back into the generator):

- returns false: business as usual, zero overhead.
- returns true (remaining time under threshold, default maybe 60s): synthesize a
  `HopSuspension`, write the checkpoint, async-invoke the resume lambda with
  `{correlation}`, return the suspended `StoryResult`.

Checking after-completion rather than before-next matters at the extreme: it guarantees every
segment completes at least one action, so even the most aggressive policy makes forward
progress instead of hop-looping before action 0.

The hop policy is two knobs feeding the same `shouldSuspend` decision:

- `timeThresholdMs`: the real case, hop when remaining time drops under it.
- `maxActionsPerSegment` (optional): hop after this many actions. Setting it to 1 hops after
  EVERY action: the maximal stress test of the durability contract, since every single action
  boundary must survive serialize -> write -> read -> deserialize -> replay. Any story state
  not reproducible from the log surfaces immediately, locally, in a normal test run. Cost is
  O(n^2) total replay plus a checkpoint write per action, so it is a test/dev setting, never
  prod.

**Resume transport: a dedicated per-service resume lambda**, not self-invoke. Federation is
what makes this possible: the resume function federation-loads any story in the service via
`storyEntryPoint` (same mechanism executeStory uses), so nothing needs to be bundled into it.
Why dedicated beats self-invoke:

- Stable wakeup target: hop invokes, resume-token clicks, and the wait-timeout scheduler all
  invoke the same single function. One exact-ARN invoke grant, which the shared multi-app
  account demands anyway.
- No event-shape grafting: no "is this secretly a resume payload?" branch in every handler
  flavor. The resume function takes `{correlation}` plus an optional wakeup payload, loads the
  checkpoint, and continues.
- Resumes don't come back through the original event source, so they don't compete with fresh
  queue/event traffic for concurrency.

It's a sibling of the executeStory / serviceFunction constructs in `quidproquo-deploy-awscdk`,
one per service. v1 spec: max timeout (900s), configurable memory (a story that started on a
high-memory function resumes on the resume function's spec; per-story matching is a later
refinement). Hops chain indefinitely; `resumeCount` and a config-driven cap guard against a
story that hops forever.

**Write ordering: the checkpoint is not a log.** The existing logger is deliberately
fire-and-forget (the extension keeps S3 off the response path); that guarantee is wrong for
checkpoints. Two paths, two contracts:

- Live-log partials: async via the extension, best-effort. A lagging or dropped entry costs
  telemetry, nothing else.
- Checkpoint: awaited direct S3 put. Only after it succeeds does the handler fire the async
  invoke of the resume function. S3 read-after-write consistency means no race window. Never
  ship a checkpoint through the extension.

Residual failure mode: crash after the checkpoint lands but before the invoke fires leaves the
story stalled. Answer is a janitor (recurring schedule re-triggering stale hop checkpoints),
parked in Later.

Dev server equivalent: checkpoint to a json file (alongside the json-file KVS backend), and
"invoke resume" schedules an in-process resume job. It deliberately round-trips the checkpoint
through full JSON serialize -> write -> read -> deserialize -> replay, never a shortcut through
in-memory state. That round-trip is the point: a story that checkpoints something
non-serializable, or replays non-deterministically, fails on the dev box instead of in prod.

Granularity caveat: hops happen at action boundaries only. A single action that itself runs
14 minutes can't be hopped through. That's acceptable; individual actions are meant to be
short, and a long wait should be `askWaitForResume`, not a blocked network call.

### 6. External resume tokens (human in the loop)

The flow that motivates this: send a verify email, suspend, and resume when the user clicks the
link, with the click delivering a payload into the story. Step Functions calls this task
tokens, Temporal calls it signals; for QPQ it is one more suspension flavor.

```ts
const resumeToken = yield* askCreateResumeToken({ expires: days(7) });
yield* askSendVerifyEmail(emailAddress, buildVerifyUrl(resumeToken));
const clickPayload = yield* askWaitForResume(resumeToken);
// clickPayload.verified === true, or clickPayload.timedOut if the link expired
```

The wrinkle that forces the two-action shape: the token must exist BEFORE the story suspends,
because it gets baked into the email that is sent first.

**Token design: selector.verifier, no table, no key.** The token is two base64url parts,
JWT-shaped but unsigned:

```
base64url(correlation) . base64url(waitGuid)
```

The correlation is the *selector*: it locates the parked state (a direct get of
`checkpoints/<correlation>.json`, which the framework stores anyway). The waitGuid is the
*verifier*: resume compares it against the waitId of the suspension the checkpoint is
currently parked on (constant-time compare, `crypto.timingSafeEqual`). Match: resume with the
payload. Mismatch or no checkpoint: reject. This is the standard selector.verifier pattern
from password-reset tokens; the checkpoint plays the role of the token table, so there is no
extra KVS row, no TTL, no encryption secret, and nothing new to provision. Fishing requires
knowing both guids, and the verifier never appears anywhere but the email and the story's own
history.

Properties that fall out for free instead of being engineered:

- *Stale tokens die naturally.* A checkpoint is parked on exactly one waitId. A story with two
  waits mints a fresh waitGuid per wait, so an old email's verifier no longer matches once the
  story has moved on (e.g. wait #1 timed out and the story looped to wait #2).
- *Single-use falls out.* After a successful resume the story is past that wait, and the
  checkpoint is deleted on completion. The same token can never match again, and a token
  sitting in an archived log points at state that no longer exists.
- *Expiry needs no TTL.* The wait's timeout scheduler resumes the story with a timed-out
  result, which un-parks the waitId; expired links then fail the match.

The actions:

- `askCreateResumeToken()`: a PURE REQUESTER in core, not a processor. It composes
  `askGuidNew()` (the verifier, minted through the guid action so it replays deterministically
  across hops) with the story's own correlation from context, and base64url-joins them. Zero
  platform code; identical on the dev server by construction.
- `askWaitForResume(token, options?)`: returns a `WaitForResumeSuspension { waitId }` and
  suspends, same checkpoint machinery as everything else. Optional expiry is a one-shot
  EventBridge Scheduler entry that invokes the resume function with a timed-out result, so
  "user never clicked" is a normal value the story handles, not an error path. (This is the
  only scheduler wiring in scope; a future askSleep would reuse it.) Dev server: setTimeout
  plus a sweep of pending timeouts on server restart.
- `askResumeStory(token, payload)`: the other side. Deliberately NOT a magic built-in route.
  App code owns the HTTP surface, so the verify-link route is an ordinary story that validates
  whatever it wants, calls `askResumeStory`, and renders its own response page. The processor
  decodes the selector, loads the checkpoint, verifies the waitId, claims, and fires the same
  resume function every other wakeup uses, with the payload delivered as `askWaitForResume`'s
  result.

Two things the deleted token table was quietly providing, now handled explicitly:

- *Double-click arbitration.* Two simultaneous clicks both read the checkpoint and both match.
  The claim is a conditional write on the checkpoint object itself (S3 If-Match on the ETag);
  first click wins, the loser gets "already used". The dev server arbitrates in-process.
- *An identifier the user never saw.* The recipient of the email now learns the correlation,
  since it is half the token. Accepted: it is an internal identifier, admin surfaces are
  authed, and the verifier is still required to do anything with it.

Dev server: identical semantics, checkpoint json on disk, resume as an in-process job.
Clicking a verify link against localhost wakes the story the same way prod does.

### 7. Live logs in qpq-admin

The `StoryProgressListener` on lambda ships entries through the existing qpq-log-extension port
(new `/log-entry` route) into cheap incremental storage:

- `partial/<correlation>/<seq>.json` objects in the logs bucket (compacted into the final
  `<correlation>.json` on completion, then deleted), or a KVS table with a TTL. Decide by cost;
  S3 puts are simpler and the extension already batches.

Admin UI: the log viewer, when a story has no final log but has partial entries, renders the
live view: completed entries as normal, plus the in-flight action from its `onActionStarted`
event with a running duration. Poll first; a websocket push via the existing websocket
infrastructure is the upgrade. Suspended stories render the suspension reason
("waiting for a resume click since ...", "hopped to new instance x3").

## Semantics and caveats (to document, not to solve away)

- **At-least-once tail action.** If the process dies mid-action (hard kill, crash), resume
  replays history and re-executes the action that was in flight. Same contract as every durable
  execution system; processors with external effects should be idempotent-friendly (correlation
  is available as an idempotency key).
- **Code drift.** A deploy between suspend and resume can change the story so replay diverges.
  `configHash` in the checkpoint detects it; v1 behavior is fail-loud with a clear error in the
  log. Pinning resume to the recorded federation hash is the later, better answer.
- **HTTP runtimes don't benefit from hops.** API Gateway caps the response window anyway. A
  story behind an HTTP route that suspends should have returned 202 + correlation up front and
  done the long work from a queue or event. Durable semantics target queue, event-bus,
  recurring, and executeStory runtimes.
- **Replay compute is O(history) per hop.** Impure actions come from the log so replays are
  fast, but pure computation between actions re-runs each hop. Fine in practice; the hop cap
  bounds it.
- **Checkpoints contain the session** (including decoded token claims), same as final logs
  today. Same bucket, same access story; just worth stating.

## Phases

1. **Core plumbing** (`quidproquo-core`): `StoryProgressListener`, `Suspend` action-result
   variant, `StoryCheckpoint` type, `createResumeActionProcessor`, `shouldSuspend` hook in
   `resolveStory`. All platform-agnostic, all unit-testable with the existing `runStory`
   helpers.
2. **Live logs** (lambda + admin): ship incremental entries via the log extension, compact on
   completion, live tail in the admin log viewer. Visible value before any durability lands,
   and it exercises the listener plumbing.
3. **Hop** (lambda + dev server): checkpoint writer, resume handler, deadline-driven
   `shouldSuspend`. Includes lifting per-runtime-type timeouts out of the CDK constructs into a
   shared definition so the dev server can apply the same synthetic deadlines. Both platforms
   land together so hop behavior is never AWS-only.
4. **External resume tokens**: `askCreateResumeToken` / `askWaitForResume` / `askResumeStory`,
   timeout scheduler wiring, dev-server equivalents alongside.
5. **Later**: `askSleep`, `askWaitForEvent` + a waiting-index KVS, fork-replay in admin (change
   action N's result, resume live), saga/compensation helpers, resume pinned to recorded
   federation hash.

## Tasks

### Phase 1: core plumbing (quidproquo-core)

- [ ] `StoryProgressListener` type - `onActionStarted` / `onActionCompleted`, optional everywhere
- [ ] Thread listener through `resolveStory` / `resolveStoryWithLogs` - emit started before `processAction`, completed after
- [ ] `Suspend` action result variant - new result type carrying the suspension descriptor
- [ ] Suspension handling in the story loop - no history push, no generator advance, return `StoryResult` tagged suspended
- [ ] `StoryCheckpoint` type - input, session, history, logs, suspension, configHash, resumeCount
- [ ] `createResumeActionProcessor` - history first, then suspension payload, then real processors
- [ ] `shouldSuspend` hook - checked right after each action completes, before its result is fed back to the generator
- [ ] Hop policy knobs - `timeThresholdMs` plus optional `maxActionsPerSegment` (1 = hop every action, test mode)
- [ ] Round-trip test - suspend after N actions, JSON round-trip the checkpoint, resume, final history identical to an uninterrupted run
- [ ] Hop-every-action test - run a multi-action story with `maxActionsPerSegment: 1`, assert one hop per action and identical final result

### Phase 2: live logs (lambda + admin)

- [ ] Log extension `/log-entry` route - accept single history entries, batch to the logs bucket
- [ ] Lambda progress listener - ship started/completed entries to `partial/<correlation>/<seq>.json`
- [ ] Compaction on completion - fold partials into the final `<correlation>.json`, delete partials
- [ ] Admin live tail - render partial entries plus the in-flight action with running duration
- [ ] Admin suspended view - show sleeping until / waiting for event / hop count

### Phase 3: hop (lambda + dev server)

- [ ] Lift per-runtime-type timeouts out of the CDK constructs into a shared definition
- [ ] CDK constructs read the shared timeout definition
- [ ] Lambda checkpoint writer - awaited direct S3 put to `checkpoints/<correlation>.json`, never via the log extension
- [ ] Resume lambda construct - per-service function in deploy-awscdk (sibling of executeStory), 900s timeout, configurable memory, single exact-ARN invoke grant
- [ ] Lambda resume handler - take `{correlation}` + optional wakeup payload, load checkpoint, federation-load the story, run with the resume processor
- [ ] Checkpoint-before-invoke ordering - async-invoke the resume function only after the checkpoint put succeeds
- [ ] Lambda deadline `shouldSuspend` - `context.getRemainingTimeInMillis` under threshold triggers a `HopSuspension`
- [ ] Dev server synthetic deadline - same shared timeouts, same threshold, same core code path
- [ ] Dev server checkpoint + resume - json file checkpoint, in-process resume job, full serialize round-trip
- [ ] `resumeCount` cap - config-driven limit on chained hops, fail loud past it

### Phase 4: external resume tokens

- [ ] `askCreateResumeToken` pure requester - compose askGuidNew + own correlation from context, base64url(correlation).base64url(waitGuid)
- [ ] `askWaitForResume` action + requester - suspends on the waitId, optional timeout
- [ ] `askResumeStory` action + requester - decode selector, load checkpoint, timingSafeEqual verifier against the parked waitId, fire the resume function with the payload
- [ ] Timeout scheduler wiring - one-shot EventBridge Scheduler entry invokes the resume function with a timed-out result, deleted on fire
- [ ] Double-click arbitration - conditional S3 write (If-Match ETag) claims the checkpoint, loser gets already-used; in-process arbitration on the dev server
- [ ] Dev server timeouts - setTimeout plus a sweep of pending wait timeouts on server restart
- [ ] Stale-token test - two waits in one story, old email's token rejected once parked on the second wait
- [ ] Example flow - verify-email story plus a verify-link route story, runnable against the dev server

### Later

- [ ] `askSleep` - short sleeps await inline, long ones suspend; reuses the timeout scheduler wiring
- [ ] `askWaitForEvent` - waiting-index KVS keyed by event name and correlation, event handler resumes matches
- [ ] Fork-replay in admin - change action N's result, resume live from there
- [ ] Resume pinned to the recorded federation hash instead of fail-loud on configHash mismatch
- [ ] Saga / compensation helpers on top of durable stories
- [ ] Stalled-checkpoint janitor - recurring schedule re-triggers hop checkpoints that never got their resume invoke
- [ ] Per-story memory matching for the resume function (v1 is one configurable memory setting)
