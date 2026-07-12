# Todo fixes: tenant/scope feature review

Findings from the review of the tenant/scope changes. Work top to bottom, urgency order.
Tick each box as it lands.

## Correctness and security

- [x] register-getall-processor - critical - The KVS GetAll processor is registered nowhere. The awslambda keyValueStore index (`quidproquo-actionprocessor-awslambda/src/getActionProcessor/core/keyValueStore/index.ts`) spreads only Delete/Get/Upsert/Update/Query/Scan, and the dev-server aggregate omits it too, so `askTenantKeyValueStoreGetAll` (and any `askKeyValueStoreGetAll`) yields an action no runtime can process. `getKeyValueStoreGetAllActionProcessor.ts` is dead code that the diff extended with scope support anyway. Export it from both indexes, and add a dev-server test that actually drives the action.

- [x] unscoped-scan-leak - critical - An unscoped Scan/GetAll on AWS returns every tenant's rows with the composed `tenant::key` pk values un-stripped (identity translator applies no begins_with filter, no strip), while the dev server's per-scope json files mean tenant rows never appear locally. Same story, different results, and leak-shaped output in prod. Decide the contract for unscoped scans over mixed tables (probably: exclude composed rows on AWS with a NOT begins_with-style filter, or strip and flag), then make both backends match. See `getKeyValueStoreScanActionProcessor.ts:20` and `getKeyValueStoreGetAllActionProcessor.ts` in awslambda.

- [x] scope-delimiter-guard - high - Neither the scope nor the raw partition-key value is checked for the `::` KVS delimiter. `validateScopeSegment` (`quidproquo-core/src/logic/scope/validateScopeSegment.ts:19`) rejects only `/`, `\`, `..` and null bytes, and `composeScopedKvsValue` accepts raw values containing `::`, so an unscoped row with pk `acme::secret` is matched by tenant acme's scoped Scan and returned with the prefix stripped. The tenant feature itself uses guid scopes checked against membership, but the core chokepoint has no guard for other consumers. Reject `:` in scopes at `validateScopeSegment`, and decide what to do about raw values that look composed.

- [x] pk-alias-parity - high - Scoped-query validation diverges between backends: the dev server validates against `['pk', pkAttribute]` and its DSL resolves the `pk` alias (`quidproquo-dev-server/src/actionProcessor/core/keyValueStore/getKeyValueStoreQueryActionProcessor.ts:30`), but the AWS translator only recognizes the store's real partition-key attribute, so an alias-keyed scoped query passes locally and throws InvalidScopeError(queryMissingPartitionKey) deployed. `kvsScopeIsolation.test.ts:120` asserts the exact shape that 500s on AWS. Either teach the AWS side the alias or drop `'pk'` from the dev-server validation so it fails locally first.

- [x] remove-debug-log - high - Leftover debug line `if (!handler) console.log(error);` in `quidproquo-core/src/logic/actionLogic.ts:54` dumps the full raw error object for every unmapped error in every runtime (CloudWatch, dev server, browser consoles), duplicating the unmapped-key log a few lines below. Delete it, or fold anything genuinely useful into the existing unmapped-error log.

- [x] instanceof-invalid-scope - medium - Six processors detect scope errors via `error instanceof InvalidScopeError` instead of the name-keyed map every sibling uses: awslambda `getFileGenerateTemporarySecureUrlActionProcessor.ts:37`, `getFileGenerateTemporaryUploadSecureUrlActionProcessor.ts:39`, and node `getFileExistsActionProcessor.ts:38`, `getFileGenerateTemporarySecureUrlActionProcessor.ts:37`, `getFileGenerateTemporaryUploadSecureUrlActionProcessor.ts:45`, `getFileDeleteActionProcessor.ts:42`. Under npm link or module federation two copies of quidproquo-core can load, instanceof fails across realms, and InvalidScope degrades to GenericError. The class sets `.name` explicitly, so switch these to `actionResultErrorFromCaughtError` with an `InvalidScopeError` map entry (the node delete one needs a small rework since it inspects an error array).

- [x] eventdoc-globals-break - medium - `askEventDocProvideStoreFromGlobals.ts:25` now unconditionally reads two new globals (eventDocOnPublish, eventDocScopeResolver) via `askConfigGetGlobal`, which throws when absent. Any consumer still registering eventDoc routes with the old hand-rolled six-key globals map (the pattern defineEventDocAi itself used before this change) breaks at request time after upgrading. Either soft-read the new globals with a default, or accept the break and sweep consumers (doccypoccy) when upgrading. Note it in the release notes either way.

## Conventions

- [x] missing-store-error-shape - medium - The missing-store misconfiguration surfaces three inconsistent ways: an inline `throw new Error(...)` in `quidproquo-actionprocessor-awslambda/.../keyValueStore/kvsScopeUtils.ts:23` (surfaces as GenericError), a generic `ErrorTypeEnum.NotFound` in the new Get-processor guard instead of a `KeyValueStoreGetErrorTypeEnum` member, and a `!` assert in the Delete processor. Use a named Error subclass with a readonly code (like InvalidScopeError) and give each action's own error enum a first-class member for it.

- [x] em-dash-sweep - low - Seven newly added comment lines use em dashes, which CLAUDE.md bans: tenant controllers `create.ts:18`, `get.ts:8`, `list.ts:14`, webserver `askProcessOnAuthenticate.ts:74` and `:83`, `askProcessOnUnauthenticate.ts:25`, and `quidproquo-core/src/testing/storyTesting.ts:113`. Replace with a period, comma, colon, or parentheses.

## Cleanup and efficiency

- [x] shared-kvs-scope-gate - medium - The scope-validation gate (store lookup, not-found throw, validateScopeSegment, validateScopeSupportedForPartitionKeyType) is copy-pasted between `quidproquo-actionprocessor-awslambda/.../kvsScopeUtils.ts` and `quidproquo-dev-server/.../kvsScopeUtils.ts`. It only depends on core utilities, so move it into `quidproquo-core/src/logic/scope/` next to `createScopedKvsTranslator` before the copies drift.

- [x] translator-double-compose - low - `scopedKvsTranslator.ts:52-53`: `keyCondition` walks and rewrites the whole condition tree twice (validate discards a full compose, then composes again). Compose once and throw when `scopedConditionCount === 0`.

- [x] strip-item-delimiter-constant - low - `stripScopedKvsItem` (`scopedKvsQueryOperation.ts:116`) hardcodes `'::'` instead of using `KVS_SCOPE_DELIMITER` / `stripScopedKvsValue`. If the delimiter ever changes, reads silently stop stripping while writes compose with the new one.

- [x] tenant-list-parallel - low - `askTenantListForUser.ts:17` hydrates each tenant summary with a sequential yield inside a for loop; the reads are independent, so batch them (askBatch/parallel) to stop GET /tenants scaling as N sequential round-trips.

- [x] onpublish-double-read - low - The tenant onPublish hook (`askTenantOnPublish.ts:14`) re-reads the full event log that `askEventDocEventAppend` just paged through in the same request, and the append path also re-fetches the summary it just upserted. Pass the events (or the folded doc) through `EventDocOnPublishInput` to make publishes one sweep instead of two-plus.

- [ ] scoped-scan-gsi - low - Scoped Scan/GetAll enforcement is a begins_with FilterExpression on a full-table Scan, so DynamoDB reads and bills every tenant's items on every scoped listing. Longer term: stamp a scope attribute at write time and add a scope-keyed GSI so scoped listing becomes a Query that only reads the tenant's partition.
