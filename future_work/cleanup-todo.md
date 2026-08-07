# Cleanup TODO

A backlog of naming and structure cleanups found by surveying the whole monorepo (core, the four
actionprocessor packages, webserver, web/web-react/web-admin, features, config-aws, deploy-awscdk,
deploy-webpack/rspack). Each section explains the problem, the fix, and has a checklist to tick off.

Effort tags:
- `[mechanical]` rename/move sweeps. TypeScript + grep make these safe, just tedious. No design decisions.
- `[moderate]` mostly mechanical but with one or two small decisions or a shared helper to write first.
- `[design]` needs a decision made and written down before touching code.

Almost everything here is a breaking change to package exports. That is fine while the project is
pre-production, but record renamed public symbols in breaking-changes.md as you go.

---

## 1. Split `qpqCoreUtils.ts` and unify the config getters `[moderate]`

### Problem

`quidproquo-core/src/qpqCoreUtils.ts` is 691 lines / 68 exports mixing at least seven concerns:
config flattening, ~40 per-domain config getters, a deploy-time validator
(`assertFifoQueueEventBusSubscriptionsAreValid`), resource-name algebra, build/bundle paths,
runtime global resolution, and URL building. `qpqCoreUtilsLib.ts` already carries a
`// TODO: Cleanup util exports` admitting it.

Within the getters, nothing is guessable:

- Exact duplicate with reversed args: `getQueueByName(configs, name)` at line 219 vs
  `getQueueConfigSettingByName(name, qpqConfig)` at line 602. Same body, same return type.
- Arg order splits: `getStorageDriveByName(name, configs)` vs `getKeyValueStoreByName(qpqConfig, kvsName)`.
- Miss behavior splits with no rule: storageDrive/queue/eventBus/kvs return `undefined`,
  secret/cryptoKey/userDirectory/parameter throw.
- Four naming shapes for "get the collection": `getQueues`, `getAllKeyValueStores`,
  `getDeployEventConfigs`, `getAllSecretConfigs`. The `getOwned*` partner rarely matches
  (`getAllSecretConfigs` pairs with `getOwnedSecrets`).
- Param name typo: `qpqConifg` (line 534). Doubled word: `getQueueQueueProcessors` (line 608).

### Fix

Pick one convention and apply it everywhere:

- `get<Domain>Configs(qpqConfig)` for collections, `get<Domain>ConfigByName(qpqConfig, name)`
  for lookups, `getOwned<Domain>Configs(qpqConfig)` for owned. Config always first param.
- Lookups return `Nullable<T>`. Callers that want throw-on-miss get a single shared
  `getConfigOrThrow` wrapper (or a `require<Domain>ConfigByName` variant) instead of per-domain throwing.
- Split the file: per-domain getters move next to their setting in `config/settings/<domain>.ts`
  (or a sibling `config/utils/` file per domain), name algebra to `config/utils/resourceName.ts`,
  build paths to `config/utils/buildPaths.ts`, validators to `config/validate/`.
- Keep the `qpqCoreUtils` namespace object exporting the same surface during migration so
  downstream packages keep compiling, then repoint them.

### Checklist

- [ ] Write the convention down (this section is the spec; adjust if needed)
- [ ] Delete `getQueueConfigSettingByName`, keep one queue lookup with the standard signature
- [ ] Rename all collection getters to `get<Domain>Configs`
- [ ] Rename all lookups to `get<Domain>ConfigByName(qpqConfig, name)` returning `Nullable`
- [ ] Replace per-domain throwing with one shared throw-wrapper
- [ ] Fix `qpqConifg` param typo and `getQueueQueueProcessors` doubled word
- [ ] Move name algebra / build paths / validators / URL helpers out into their own files
- [ ] Repoint downstream packages, then delete the compat namespace re-exports
- [ ] Split `qpqCoreUtils.test.ts` (23KB) to match the new files

---

## 2. One identity field on config settings: `name` `[moderate]`

### Problem

Every setting spells its identity differently:

- `eventBus.ts` uses `name`
- `storageDrive.ts` uses `storageDrive`
- `secret.ts` uses `key`
- `cryptoKey.ts` uses `keyName`
- `keyValueStore.ts` uses `keyValueStoreName`

Each also copies the value into `uniqueKey`, and every lookup helper hard-codes its domain's
spelling (`sd.storageDrive === name` vs `kvs.keyValueStoreName === name`). Generic tooling over
settings can't exist.

### Fix

Standardize on `name: string` on every resource-identifying setting. The setting type already
carries the domain, so `storageDrive.storageDrive` says nothing `storageDrive.name` doesn't.
This unblocks a single generic `getConfigSettingByName(qpqConfig, type, name)` under section 1.

### Checklist

- [ ] Rename identity fields to `name` in core settings (storageDrive, secret, cryptoKey, keyValueStore, and any others)
- [ ] Same sweep in quidproquo-webserver and quidproquo-config-aws settings
- [ ] Update every getter/processor/construct that reads the old field names
- [ ] Record the renamed public fields in breaking-changes.md

---

## 3. One file convention for `define*` settings `[mechanical]`

### Problem

Three layouts coexist in `quidproquo-core/src/config/settings/` alone:

- Flat file named after the resource: `queue.ts` (the majority, 28 files)
- Folder + define-named file: `apiBuildPath/defineApiBuildPath.ts`
- Folder + domain-named file: `graphDatabase/graphDatabase.ts`
- Folder with no `define*` at all: `emailTemplates/` (just types)
- Flat file named after the function: `definePromiseMode.ts` (only one in core)
- File/export mismatch: `applicationName.ts` exports `defineApplication`

Same drift in webserver (`defineAuthSystem/defineAuthSystem.ts` vs flat `cache.ts`) and config-aws
(`awsKmsKey.ts` vs `waf/defineWafProtection.ts`).

Also:

- Return types split: `definePromiseMode` and `applicationVersion` return `QPQConfig` (an array)
  while ~30 siblings return a single `QPQConfigSetting`, so they compose differently for no reason.
- `Settings` suffix applied arbitrarily: `defineFileUploadSettings`, `defineStorageDriveCorsSettings`,
  `defineAwsVirtualNetworkSettings` vs `defineCache`, `defineApi`, `defineAwsKmsKey`.
- Advanced-options types: 15 are `QPQConfigAdvanced<X>Settings extends QPQConfigAdvancedSettings`,
  but `FederatedModuleStoreOptions`, `BackendBundleOptions`, `FrontendBundleOptions` break the
  pattern and silently can't accept `deprecated`.
- `deprecated?: boolean` lives on the base advanced type but only eventBus actually copies it
  through. Either move it onto `QPQConfigSetting` handling in one place, or drop it.
- The `aws` filename prefix in config-aws is arbitrary: `awsAlarm.ts` vs `domainCertificate.ts`,
  and `serviceAccountInfo.ts` exports `defineAwsServiceAccountInfo` (file/export disagree).

### Fix

One rule: flat file named after the resource, exporting `define<Resource>` returning a single
setting (or, when it genuinely bundles several, a `QPQConfig` with the return type annotated and
the name signalling it, e.g. `define<Resource>Feature`). Drop the `Settings` suffix from function
names. Advanced-options types are always `QPQConfigAdvanced<X>Settings extends QPQConfigAdvancedSettings`.
In config-aws, drop the `aws` filename prefix (everything in the package is AWS) but keep it in
the exported function names since those are imported alongside core defines.

### Checklist

- [ ] Flatten `apiBuildPath/`, `graphDatabase/`, `emailTemplates/` (core) to flat files
- [ ] Rename `definePromiseMode.ts` to `promiseMode.ts`; fix `applicationName.ts` / `defineApplication` mismatch
- [ ] Decide + annotate return types (setting vs array), make the array-returners deliberate
- [ ] Drop `Settings` suffix: `defineFileUpload`, `defineStorageDriveCors`, `defineAwsVirtualNetwork`
- [ ] Fold `FederatedModuleStoreOptions` / `*BundleOptions` into the `QPQConfigAdvanced*Settings` pattern
- [ ] Make `deprecated` work uniformly or delete it
- [ ] webserver: flatten `defineAuthSystem/`, align file names
- [ ] config-aws: flatten `waf/`, drop `aws` file prefix, fix `serviceAccountInfo.ts` mismatch

---

## 4. Enforce `ask<Noun><Verb>` and one payload-type suffix `[mechanical]`

### Problem

The convention exists in CLAUDE.md but is only ~50% followed:

- Verb-first: `askNewGuid`, `askThrowError`, `askGetOpenApiSpec`, `askPutGenericDataResource`,
  `askScanGenericDataResource`, `askGetCurrentEpoch`, `askGetApplicationVersion`, `askRunParallel`
- No domain at all: `askRandomNumber` (math), `askDelay` (platform), `askBatch` (system)
- Filename/export mismatch: `askCreateBinaryData.ts` exports `askCreateTextQpqBinaryData`

Payload/options types use five suffixes: `*ActionPayload`, `*Options`, `Ask*Options`, `*Request`,
`*Result` / `*ActionResult`. `KvsUpdate` sits next to `KeyValueStoreGetOptions` in the same domain
(see section 12 for the Kvs/KeyValueStore split).

### Fix

Rename sweep to `ask<Noun><Verb>` (askGuidNew, askErrorThrow, askOpenApiSpecGet,
askGenericDataResourcePut...). Some of these read worse noun-first; where it is genuinely awkward,
decide per-domain but write the exception down here. Payload types: `<Action>Options` for input
bags, `<Action>Result` for outputs, no `Ask` prefix, no `ActionPayload`. The eslint config already
polices the `ask` prefix for generators; extend it (or add a check script) for the noun-first order
if practical.

### Checklist

- [ ] List every offender (`grep -r "export function\* ask" | sort` and eyeball)
- [ ] Rename verb-first requesters in core (guid, error, dateTime stories, system stories)
- [ ] Rename webserver offenders: `askGetOpenApiSpec`, `askPutGenericDataResource`, `askScanGenericDataResource`
- [ ] Fix `askCreateBinaryData.ts` filename/export mismatch
- [ ] Normalize payload type suffixes to `*Options` / `*Result`
- [ ] Note deliberate exceptions in this doc

---

## 5. Typo sweep of public names `[mechanical]`

### Problem

Misspellings are frozen into directories and exported APIs, and several coexist with correctly
spelled siblings so both spellings are live at once:

- `apiGatwayEvent/` directory in actionprocessor-awslambda, plus `getApiGatwayEventWebsocketWithIdentity_websocketEvent.ts`,
  leaked into deploy-awscdk's `QpqApiWebserverWebsocketConstruct.ts`. Sibling files spell
  `apiGateway` correctly. `getLambdaEntries.ts` even has a comment: "yes, including the apiGatway spelling".
- `virualNetworkName` field + `getVirualNetworkConfigs` in core (the setting itself is spelled
  correctly: `defineVirtualNetwork`), leaked into deploy-awscdk and dev-server.
- `defineAwsDyanmoOverrideForKvs` + `AwsDyanmoOverrideForKvsQPQConfigSetting` (config-aws)
- `preformNetworkRequest.ts` (webserver utils, should be "perform")
- `proiseify/` (core top-level folder, should be "promisify")
- `useLogLogMananagement` (web-admin, three files + call site)
- `WebserverRoll` class wrapping an IAM Role (deploy-awscdk, probably meant "Role")
- `AuthenticateUserCustomChallengeChallenge.ts` (doubled "Challenge")

### Fix

Straight renames. Because `getLambdaEntries.ts` string-matches lambda filenames, do the awslambda
`apiGatway` rename in one commit covering the directory, the handler files, and the string list
together.

### Checklist

- [ ] `apiGatway` -> `apiGateway` (directory, handlers, `getLambdaEntries.ts` strings, cdk import) in one commit
- [ ] `virualNetworkName` -> `virtualNetworkName`, `getVirualNetworkConfigs` -> `getVirtualNetworkConfigs` (+3 downstream files)
- [ ] `Dyanmo` -> `Dynamo` in config-aws (file, function, two types)
- [ ] `preformNetworkRequest` -> `performNetworkRequest`
- [ ] `proiseify` -> `promisify` (folder + barrel)
- [ ] `useLogLogMananagement` -> `useLogManagement` (also drops the doubled "Log")
- [ ] `WebserverRoll` -> `WebserverRole`
- [ ] `AuthenticateUserCustomChallengeChallenge` -> `AuthenticateUserCustomChallenge`

---

## 6. Settle `WebSocket` vs `Websocket` casing `[mechanical]`

### Problem

Both casings are live everywhere, sometimes in one file:

- `webserver/src/config/settings/websocket.ts` exports `defineWebsocket` next to
  `QPQConfigAdvancedWebSocketSettings` and `WebSocketQPQWebServerConfigSetting`
- web-react has sibling top-level modules `websocket/` and `webSocketQueue/`
- Hooks mix freely: `useSubscribeToWebsocket.ts` vs `useSubscribeToWebSocketEvent.ts`,
  `useWebSocketIsAuthenticated.ts` vs `useWebsocketAuthSync.ts` in the same folder
- `WebsocketActionType.ts` (webserver) vs `webSocketQueue/` (features)

### Fix

Pick one. Suggestion: `Websocket` in identifiers (`websocket` folders), because "Websocket" as a
single word avoids the `webSocketQueue` mid-word hump and matches the existing action type. Apply
everywhere; the wrong-cased names are pure renames.

### Checklist

- [ ] Decide the casing (write it in CLAUDE.md)
- [ ] Sweep webserver (settings, actions)
- [ ] Sweep web-react (`webSocketQueue/` folder + all hooks)
- [ ] Sweep features (`webSocketQueue/`)
- [ ] Related: also settle `WebServer` vs `Webserver` (deploy-awscdk has one `QpqWebServerCacheConstruct` among nine `Webserver` siblings)

---

## 7. Deduplicate the awslambda event-source template, add a combinator `[moderate]`

### Problem

The 13 folders under `actionprocessor-awslambda/.../core/event/` each contain the same 6 files
(`getEventAutoRespond*`, `getEventGetRecords*`, `getEventGetStorySession*`, `getEventMatchStory*`,
`getEventTransformResponseResult*`, `types.ts`). Measured by md5:

- `getEventGetStorySessionActionProcessor.ts`: 10 byte-identical copies
- `getEventAutoRespondActionProcessor.ts`: 8 byte-identical copies
- all 13 `index.ts` identical modulo the exported name

Only sqs/queue and s3/fileEvent actually specialize anything. Two of the api folder's files exist
purely to re-wrap a quidproquo-webserver export so the folder matches the template.

The 13 aggregators also use three naming schemes: `getEventBridgeEventActionProcessor`,
`getSqsQueueEventProcessor` (nothing else in the repo ends in `EventProcessor`), and doubled-Event
names like `getApiGatewayApiEventEventProcessor`.

Related: across all four processor packages, ~60 `index.ts` files hand-write the identical
aggregate shape (`async (qpqConfig, loader) => ({ ...(await getA(...)), ...(await getB(...)) })`).
Two are byte-identical across packages (`core/metric/index.ts` in awslambda and js). Core has
`createActionProcessor` for leaves but nothing for aggregates.

### Fix

- Add `combineActionProcessors(resolvers: ActionProcessorListResolver[]): ActionProcessorListResolver`
  to quidproquo-core next to `createActionProcessor`, and replace all ~60 hand-written aggregators.
- Create a `defaultEventProcessors` (or per-file default exports) in the event folder that the 10
  non-specializing event sources import; keep real overrides only where sqs/s3 differ.
- Rename all 13 aggregators to the standard `get<Source>EventActionProcessor` shape, deleting the
  `EventProcessor` suffix and doubled Events.

### Checklist

- [ ] Write `combineActionProcessors` in core (+ test)
- [ ] Replace hand-written aggregate barrels in all four processor packages and dev-server
- [ ] Extract shared default event processor files; delete the 40+ identical copies
- [ ] Delete the delegation-only re-wrap files in `event/apiGatwayEvent/api/`
- [ ] Rename aggregators: one `get<Source>EventActionProcessor` scheme, no doubled "Event"

---

## 8. Shared error-type vocabulary for actions `[design]`

### Problem

The distinct not-found names (`StoreNotFound`, `DriveNotFound`, `FileNotFound`, `UserNotFound`,
`QueueNotFound`, `TopicNotFound`, `DirectoryNotFound`) are deliberate: they differentiate which
entity was missing when errors surface from composed sub-stories, and the enum value is
`${actionType}-${errorName}` so the readable suffix is what you see in logs and catch branches.
Keeping them specific is correct. Do NOT collapse them into a generic `NotFound`.

What has drifted is the *meaning* of the names across domains, not the names themselves:

- kvs actions consistently use a two-axis pair: `StoreNotFound` = "not declared in qpq config
  (misconfiguration)" and `ResourceNotFound` = "the underlying table does not exist" (infra).
- `askConfigGetSecret` uses `ResourceNotFound` to mean "the secret does not exist", i.e. the
  named thing itself, which is the opposite end of the axis from what kvs means by it.
- file/queue/eventBus collapse both axes into one name (`DriveNotFound` / `QueueNotFound` /
  `TopicNotFound` = "does not exist", ambiguous between config-missing and infra-missing).

So the same literal means different things in different domains, and only kvs distinguishes
config-miss from infra-miss at all. Same question mark hangs over `LimitExceeded` vs
`QuotaExceeded` vs `Throttling` (rate vs capacity?) and `Unauthorized` vs `AccessDenied`
(authn vs authz?): possibly genuine distinctions, but nothing writes the definitions down, so
usage can't be audited.

Also: 41 of ~90 requesters declare no `errorTypes` at all, including ones that clearly fail
(`askAiPrompt`, `askGraphDatabaseExecuteOpenCypherQuery`, `askUserDirectoryAssociateSoftwareToken`),
while siblings in the same folders do declare them. Absence currently means "not migrated yet",
not "cannot fail". And `askDynamicFunctionExecute` is the one action still using a hand-written
error enum instead of the `errorTypes` catalog, so its errors aren't namespaced by
`createErrorEnumForAction` and can't be caught like every other domain's.

### Fix

Keep the specific names; write down what each axis means and make every domain use the same
scheme. Suggested axes (adjust in discussion):

- `<Entity>NotFound` for a named entity that does not exist, where Entity says which one
  (Store/Drive/File/User/Queue/Topic/Directory). Every domain that has both a container and an
  item declares both (file already does: DriveNotFound + FileNotFound).
- One dedicated name for "not declared in qpq config", used by every domain the same way.
  kvs currently spells it `StoreNotFound`; a name like `NotConfigured` would separate it from
  the entity axis and free `<Entity>NotFound` to always mean the runtime thing. Decide once.
- `ResourceNotFound` is the one genuinely vague literal (means infra-missing in kvs, entity-missing
  in config): replace its uses with whichever axis each occurrence actually means.
- Define `Throttling` / `LimitExceeded` / `QuotaExceeded` and `Unauthorized` / `AccessDenied`
  (or merge whichever pairs turn out to have no real distinction in the processors).

Then audit catalogs against the definitions, and separately fill in the 41 empty ones (per the
existing rule: an action's enum is its full error catalog; check the processor implementations
for what each can actually throw).

### Checklist

- [ ] Write the axis definitions down (this doc or CLAUDE.md) before renaming anything
- [ ] Decide the "not declared in qpq config" name; apply it in every domain that can miss config
- [ ] Replace each `ResourceNotFound` use with the specific name for what's actually missing
- [ ] Define or merge Throttling/LimitExceeded/QuotaExceeded and Unauthorized/AccessDenied
- [ ] Migrate `askDynamicFunctionExecute` to `errorTypes` + `createErrorEnumForAction`
- [ ] Fill in `errorTypes` for the 41 requesters that have none (audit processors per action)
- [ ] Update processor error maps that produce renamed literals

---

## 9. Make the four actionprocessor packages structurally identical `[moderate]`

### Problem

- Root folder: node/js/web use `src/actionProcessor/`; awslambda alone uses `src/getActionProcessor/`
  (a folder named after a function), and one path nests it twice:
  `getActionProcessor/core/graphDatabase/customActions/getActionProcessor/`.
- node keeps two extra processor trees at src top level under invented names:
  `dynamicActionProcessor/file/` and `traceStoryExecution/`, though file and system are ordinary
  domains everywhere else.
- Identically named exports with incompatible signatures: `getFileActionProcessor` is curried
  `(config) => resolver` in node but a bare resolver in awslambda; both are package-root exports,
  distinguishable only by import path. Same class of problem for `getCoreActionProcessor`,
  `getWebserverActionProcessor`, etc. across 2-4 packages each.
- Curried factories are named `get*` in node/dev-server but `create*` in web
  (`createApiRequestActionProcessor`, the only such filename in all four packages).
- Package-level composition differs: awslambda has `getAwsActionProcessors` inside the tree, web
  has `getWebActionProcessors` at src root, js and node have none (consumers spread domains
  themselves). dev-server's `getCoreActionProcessor` takes a third param, silently breaking the
  `ActionProcessorListResolver` contract the name implies.
- Barrels disagree on re-exporting leaves (js core barrel: 12 `export *` lines; web core barrel: 0),
  so whether a leaf processor is importable from a package root is arbitrary per domain.

### Fix

One layout for all four packages plus dev-server:

- Root folder is `src/actionProcessor/<domain>/`; fold node's `dynamicActionProcessor/file` into
  `actionProcessor/core/file/` and `traceStoryExecution` into `actionProcessor/core/system/`.
- Naming rule: a plain `ActionProcessorListResolver` is `get<X>ActionProcessor`; a factory that
  takes config and returns one is `create<X>ActionProcessor(config)`. Rename node's curried file
  processors accordingly, which also fixes the same-name/different-signature collision.
- Every package exports one composition entry: `get<Platform>ActionProcessors`
  (aws/node/js/web/devServer), in the same place (`src/actionProcessor/index.ts`).
- Pick one barrel policy (aggregator only, no leaf `export *`) and apply to all ~60 domain barrels.

### Checklist

- [ ] awslambda: rename `getActionProcessor/` -> `actionProcessor/`, kill the doubled nested folder
- [ ] node: fold `dynamicActionProcessor/` and `traceStoryExecution/` into the standard tree
- [ ] Rename curried factories to `create*ActionProcessor` (node file processors, dev-server ones)
- [ ] Add `getNodeActionProcessors` / `getJsActionProcessors`; align web + awslambda entry locations
- [ ] Fix dev-server's three-param `getCoreActionProcessor` (rename it, it isn't a resolver)
- [ ] One barrel policy across all domain barrels
- [ ] dev-server: drop the meaningless `Override` suffix on `graphDatabaseOverride/` and `serviceFunctionOverride/`
- [ ] Align the four package.json files (types path, test:watch script; consider an `exports` map so the
      `quidproquo-actionprocessor-node/lib/commonjs/...` deep import in awslambda becomes a real subpath)

---

## 10. Finish the state-module layout migration (web-admin, features) `[moderate]`

### Problem

CLAUDE.md documents one shape (types/ effects/ actionCreators/ stateUpdaters/ logic/ selectors/
constants/, chrome as the canonical example) but three eras coexist:

web-admin:

- Pre-module bucket triples: `Auth/logic/authActionCreator.ts` + `authTypes.ts`, repeated verbatim
  in three more Auth challenge folders; `useSharedQueryParams/logic/sharedQueryParamsActionCreator.ts`
  + `Reducer` + `Types` in web-react.
- `adminApp/` keeps state types (`AdminAppState.ts`, `SessionLogState.ts`...) and reducers at module
  root instead of `types/` / a reducer home; `selectors/` is nested under `logic/`.
- Effects folders disagree on suffix: `effects/session/*Event.ts` vs `effects/sessionLog/*Effect.ts`.
- `effects/volatile/` splits payloads into standalone `*Payload.ts` files against the
  "effect + its payload share a file" rule.
- `stateUpdaters/` filenames drop the module prefix (`logSearchStarted.ts`) that `actionCreators/`
  keeps (`askUIVolatileLogSearchStarted.ts`), so leaf-path imports are ambiguous.
- `platformLogic/effects/system/systemActionCreators.ts`: action creators living under effects, in a bucket file.

features:

- `stateUpdaters/` sometimes at module root (list, importUi, chrome), sometimes nested under
  `reducer/`, `fold/`, or `views/document/`.
- `transport/` vs `requests/` for the same concept (eventDocAi uses `requests/`).
- `eventDocAi/module` keeps `EventDocAiState.ts` at root with no `types/` folder.
- `tenant/module` has almost none of the layout (its effects are declared elsewhere).
- `admin/maintenance/eventDoc/v1` nests actionCreators/effects under an extra `events/` level.
- Api surface naming: five `shared*Api.ts` modules vs the canonical chrome module which drops the
  prefix (`eventDocWorkspaceChromeApi.ts`). Pick one (suggestion: keep `shared*Api` since it is the
  5:1 majority, rename chrome's).
- `eventDoc/logic/selectors/` files aren't `select*`-prefixed (`draftVersion.ts`, `latestPublished.ts`).

### Fix

Mechanical migration to the documented shape, module by module. No design work; the target layout
is already written down. Do web-admin's Auth triples and adminApp first (worst offenders), then the
features modules.

### Checklist

- [ ] web-admin Auth: convert 4 bucket-file triples to the module shape
- [ ] web-react `useSharedQueryParams`: same
- [ ] adminApp: move `*State.ts` into `types/`, reducers/runtime into their folders, hoist `selectors/`
- [ ] adminApp effects: one suffix (`*Effect.ts`), fold standalone `*Payload.ts` files into their effects
- [ ] stateUpdaters: restore module prefixes in filenames
- [ ] platformLogic: split `systemActionCreators.ts` into per-file `askUI*` under `actionCreators/`
- [ ] features: hoist nested `stateUpdaters/` to module root everywhere
- [ ] features: `requests/` -> `transport/` in eventDocAi
- [ ] features: give eventDocAi and tenant/module the standard folders
- [ ] features: flatten the `events/` level in admin/maintenance/eventDoc/v1
- [ ] Api files: one prefix rule, rename the outlier
- [ ] Rename eventDoc selectors to `select*` / `create*Selector`

---

## 11. CDK construct naming: one shape `[mechanical]`

### Problem

Five competing name shapes in deploy-awscdk:

- Qualifier prefix: `ApiQpqWebserverApiConstruct`, `BootstrapQpqCoreVirtualNetworkConstruct`
- Qualifier infix: `QpqApiCoreQueueConstruct`, `QpqBootstrapConfigWafConstruct`
- Flipped word order for the same two words: `QpqApiCoreQueueConstruct` vs `QpqCoreApiGraphDatabaseConstruct`
- A stray `Inf`: `QpqInfCoreUserDirectoryConstruct`
- Unexplained abbreviation: `BSQpqLambdaWarmerEventConstruct`, whose class is
  `BSQpqLambdaWarmerEventConstructConstruct` (doubled suffix)

Plus file/class mismatches (`QpqCoreNotifyError.ts` exports `QpqCoreNotifyErrorConstruct`, two more
like it), `constructs/basic/Function.ts` exporting `class Function` (shadows the global),
`QpqCoreAiConstruct` being the one "construct" that doesn't extend `QpqConstructBlock`, and
`AccountQpqStack` vs siblings `*QpqServiceStack`.

### Fix

One shape: `Qpq<Phase><Layer><Resource>Construct` (e.g. `QpqApiCoreQueueConstruct`), file named
exactly after the class. Expand `BS`, rename `Function` to `QpqFunction` (also resolve its two
inline `// TODO: Rename` comments on `functionType` / `executorName`), make `QpqCoreAiConstruct`
either extend `QpqConstructBlock` or lose the `Construct` suffix, and align `AccountQpqStack` with
the `*QpqServiceStack` scheme (or document why account-level is different).

### Checklist

- [ ] Rename constructs to the single `Qpq<Phase><Layer><Resource>Construct` shape
- [ ] Fix file/class mismatches (NotifyError, AwsAlarm, AwsOrganization)
- [ ] `BSQpqLambdaWarmerEventConstructConstruct`: expand BS, drop doubled suffix
- [ ] `Function` -> `QpqFunction` + resolve its TODO prop renames
- [ ] `QpqCoreAiConstruct`: extend QpqConstructBlock or rename
- [ ] `AccountQpqStack` naming decision
- [ ] Fix the duplicated `QPQConfigAdvancedAwsAlarmSettings` interface declared twice in
      config-aws `awsAlarm.ts` (lines 119 and 125; interface merging hides it, and it's a reason
      to convert settings interfaces to `type` per CLAUDE.md)

---

## 12. Small one-off fixes and convention violations `[mechanical]`

Each of these is minutes of work; batched here so they don't need their own sections.

- [ ] Delete dead files: `getIsLoadingFromLoadingCount copy.ts` (byte-identical Finder dupe),
      `web-admin/src/tmp/RandomView.tsx` (unreferenced scratch component)
- [ ] Untrack `.DS_Store` (core `src/actions/`, web-admin `adminApp/logic/`) and add to .gitignore
- [ ] `quidproquo-transpile/` at repo root is build residue (lib only, no src, not a workspace):
      delete or gitignore
- [ ] Move the ten root-level planning/audit .md files (`cleanup_list.md` 326KB, `packageinfo.md`,
      `breaking-changes.md`, `COMPLIANCE_ISSUES.md`, `missing-error-list.md`, `action-migration.md`,
      `security_findings.md`, `qpqadminplan.md`, `trace-replay-plan.md`,
      `EVENTDOC_SORTABLE_INDEX_MIGRATION.md`) into `future_work/` or `docs/`; delete the stale ones
- [ ] `packageinfo.md` still documents jotai and a deleted `hooks/asmj/` path; update or delete.
      Also remove the stale "computed atom" comment in web-admin `useSessionState.ts:9`
- [ ] Remove `askParallelDEPRECATED` (or fill in its `@deprecated since X.X` and move it to
      `stories/`, since it has no action type and doesn't belong in `actions/`)
- [ ] Remove the unmarked `export const askLog = askLogTemplateLiteral` alias (or deprecate properly)
- [ ] Kvs vs KeyValueStore: pick one per-context rule (suggestion: `KeyValueStore` in public type
      names, `kvs` only in local vars) and rename `KvsItemRecord` / `KvsUpdate` / `stories/kvs/` or
      the long forms, not the current mix
- [ ] `TDateIso` helpers (`addDaysToTDateIso` etc.): the type is now `QpqIsoDateTime`; rename the
      functions, type them against the branded type, and move them from `stories/dateTime/addTime/`
      to `utils/` (they're sync, non-ask helpers)
- [ ] `types/utils/` vs `utils/types/` in core: rename one (suggestion: `utils/types/` ->
      `utils/typeGuards/`)
- [ ] Unify auth-challenge types: `types/authChallenge/` (with its nested `types/`) and
      `actions/userDirectory/types/AuthChallenges/` are one domain in two homes
- [ ] Root barrel: `export * from './logic/actionLogic'` in core `index.ts` looks redundant but is
      load-bearing (logic/index.ts doesn't re-export it); fix `logic/index.ts` and drop the extra line
- [ ] Resolve the two self-flagged files: `logic/transientErrorNames.ts` ("This is a shit file")
      and `logic/actionLogic.ts` ("this does not belong here")
- [ ] Enum style sweep per the agreed rule (PascalCase members for effect/action enums, camelCase for
      value-like): fix `MetricUnit` (`count = 'Count'`), `StorageDriveTier` (SCREAMING), drop the
      `Enum` suffix from the 5 outliers (`ErrorTypeEnum`, `LogLevelEnum`, `ScheduleTypeEnum`,
      `AiStreamFinishReasonEnum`, webserver's `GenericDataResourceActionTypeEnum`)
- [ ] Action-type string casing: `'@quidproquo-core/Event/GetRecords'` vs `'@quidproquo-core/event/MatchStory'`
      in ONE enum; same lowercase drift in `ErrorActionType` and `QPQCoreConfigSettingType`. These are
      processor registration keys, so change enum + processors together and note it in breaking-changes.md
- [ ] Enum key/value plural mismatches: `SendMessages = '.../SendMessage'` (queue + eventBus),
      `NewSortableMany`
- [ ] `DynamicFunctions` (plural) vs `InlineFunction` (singular) as sibling domain names: singularize
- [ ] Config-convention violations (existing rules, not new ones): remove `xName?` overrides
      (`virtualNetworkName?` on api, `subDomainName?`/`cacheSettingsName?` on webEntry,
      `applicationName?`/`serviceName?` on apiKey, `functionName?` on inlineFunction); un-spread the
      two `...define*()` calls in features (`defineTenant.ts:65`, `defineAdminSettings.ts:326`);
      move `dnsRecord`/`emailTemplates` off core `defineUserDirectory` into webserver settings;
      move `cloudflareApiKeySecretName` out of generic webserver api/websocket/webEntry settings
- [ ] keyValueStore `owner` bypasses `convertCrossModuleOwnerToGenericResourceNameOverride`
      (declares plain `CrossModuleOwner`, assigns raw); align with the 11 settings that normalize.
      Also `schedule.ts` uses override key `'recurringSchedule'` where siblings use `'<x>Name'`
- [ ] webserver `services/*`: `types/types.ts` and `config/constants.ts` bucket files (auth,
      cloudflare) -> one-per-file; migration's `domain/` -> `models/`; two different
      `onDeployLogic.ts` files -> ask-named stories
- [ ] webserver utils: suffix consistency (`preformNetworkRequest` is also the only non-`*Utils` file there)
- [ ] web-react tidy: `state/` folder holds one generic hook (move to `hooks/`, delete folder);
      hoist `useFieldBinding/` and `useSharedQueryParams/` into `hooks/` or promote them properly;
      `useQpq.ts` is self-labelled WIP with a stub logger (finish or move out of the public surface)
- [ ] web-admin: add the missing barrels (LogViewer + subfolders), pick flat-vs-folder for
      components and apply; rename one of the two colliding `actionComponentMap` trees (the
      `logic/actionComponentMap/` one holds field-name lists, not components; name it
      `actionDetailFieldMap` or similar)
- [ ] `AuthState` declared in both web-admin and web-react (web-admin depends on web-react): delete
      the web-admin copy
- [ ] deploy-webpack/rspack: delete the four orphan `.test.ts` files with no source (mirrored in both
      packages); `QPQ` vs `Qpq` casing (`setupRspackQPQRuntime.ts` vs `getRspackConfigForQpq.ts`);
      give deploy-webpack a real `src/index.ts` like rspack instead of the documented vitest
      workaround in `index.test.ts`
- [ ] awslambda grab-bag: give the 12 `src/logic/*` subfolders their missing `index.ts` and remove
      the deep exports from the root barrel (the TODO there admits it); `lambdas/index.ts` line 1
      violates its own "deliberately empty" comment; consolidate the five helper-folder names
      (logic/utils/helpers/lambda-utils/*Utils.ts) into one convention
- [ ] Move `awsNamingUtils` out of actionprocessor-awslambda into a small shared package (or
      config-aws): deploy-awscdk and quidproquo-cli currently import a runtime lambda package just
      for naming, pulling in handlers and AI processors
- [ ] Gather the scattered `resolve<Resource>Name` helpers (`resolveParameterKey`,
      `resolveSecretResourceName`, `resolveCryptoKeyAlias`, `resolveStorageDriveBucketName`) into one
      home with one suffix
- [ ] Stray non-processor files in processor folders: `core/system/getDateNow.ts` (reads like a
      processor, is a clock helper), `core/ai/aiModelMap.ts` (config data), the 30-file
      `graphDatabase/stories/` subtree (move to a proper home)
- [ ] `testing/` helpers: awslambda and node each have one, differently shaped, neither exported;
      align and export them so `invokeProcessor` / `runFileAction` stop diverging

---

## Suggested order

1. Section 5 (typos) and section 12's dead-file/root-clutter items: zero risk, instant wins
2. Section 3 (define* files) and section 6 (Websocket casing): pure renames, small blast radius
3. Section 1 (qpqCoreUtils) + section 2 (identity field): do together, they feed each other
4. Section 7 (event template + combinator): big line-count win, self-contained in awslambda + barrels
5. Section 9 (processor package alignment): after 7, since 7 touches the same barrels
6. Section 4 (ask naming) and section 11 (constructs): any time, mechanical
7. Section 10 (state modules): module-by-module, can be spread out
8. Section 8 (error vocabulary): last, it needs the design discussion first
