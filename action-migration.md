# Action factory migration

Every action in the codebase is being migrated from the old hand-written type boilerplate
(`*ActionTypes.ts` files declaring `XAction`, `XActionProcessor`, `XActionRequester`) to the
action factory pair in `quidproquo-core`:

- `createActionRequester` (`quidproquo-core/src/types/utils/createActionRequester.ts`)
- `createActionProcessor` (`quidproquo-core/src/types/utils/createActionProcessor.ts`)
- the type family (`ActionOf`, `ActionReturnOf`, `ProcessorFor`) in
  `quidproquo-core/src/types/ActionRequesterFunction.ts`

This file is the work list. Each unchecked item below is one migration unit: convert it,
tick the box, commit. The list is a best-effort index; the source of truth for "which
processors implement this action" is a grep for the ActionType member
(e.g. `grep -rn "ConfigActionType.GetSecret" quidproquo-*/src`). Always do that grep,
some processors live under per-event-source folders or override layers with different
file names.

## How the new system works

The requester is the single source of truth for an action. One definition object produces
the callable `ask*` generator, and the action type, payload builder and error enum ride on
the function as typed runtime metadata:

```ts
export const askConfigGetSecret = createActionRequester<string>()({
  actionType: ConfigActionType.GetSecret,
  errorTypes: [
    'ResourceNotFound', // secret does not exist
    'Throttling', // request rate exceeded
  ],
  getPayload: (secretName: string) => ({ secretName }),
});
```

- The curried `()` exists because TypeScript has no partial type inference
  (microsoft/TypeScript#26242): the outer call pins the return type, the inner call infers
  everything else.
- Call sites are unchanged: `yield* askConfigGetSecret('name')`. Signature help shows
  `askConfigGetSecret(secretName: string): AskResponse<string>`.
- The old standalone `XErrorTypeEnum` export is replaced by metadata:
  `askConfigGetSecret.errorType.ResourceNotFound`.
- `getPayload` and `errorTypes` are both optional. A payload-less action is just
  `createActionRequester<string>()({ actionType: SystemActionType.GetRuntimeCorrelation })`.

Processors key off the requester itself, so the registration key and the payload/return
types can never drift:

```ts
const getProcessConfigGetSecret = (qpqConfig: QPQConfig): ProcessorFor<typeof askConfigGetSecret> => {
  return async ({ secretName }) => { ... };
};

export const getConfigGetSecretActionProcessor = createActionProcessor(askConfigGetSecret, getProcessConfigGetSecret);
```

Worked examples to copy from (find them with `git log --oneline`, messages listed newest last):

- `core: createActionRequester and createActionProcessor helpers` the factory machinery itself
- `askConfigGetSecret: migrate to action factory` plain payload + error catalog, processors in awslambda and dev-server
- `askBatch, askGetRuntimeCorrelation: migrate to action factory` base + story split with a generic return, and a payload-less action

## Migration recipe (per checklist item)

1. Rewrite the requester file using `createActionRequester`. Fold the
   `createErrorEnumForAction` call into `errorTypes` (keep the per-entry comments).
2. Rename the file (and its test) to the main export: `ConfigGetSecretActionRequester.ts`
   becomes `askConfigGetSecret.ts`. For base + story files the name follows the public
   story (`askBatch.ts` holds `askBatch` and `askBatchBase`). Repoint the folder barrel
   and any sibling relative imports; cross-package imports go through the package barrel
   and are unaffected.
3. Delete the sibling `*ActionTypes.ts` file and remove its line from the folder's
   `index.ts` barrel.
4. Repoint consumers of the deleted types:
   - `XActionProcessor` becomes `ProcessorFor<typeof askX>`
   - `XAction` becomes `ActionOf<typeof askX>`
   - `XErrorTypeEnum.Member` becomes `askX.errorType.Member`
   - a payload type other files genuinely import stays as a named type in the requester
     file (see `SystemBatchActionPayload`); otherwise inline it into `getPayload`
5. Convert every processor: grep the ActionType member across `quidproquo-*/src`, and in
   each hit replace the hand-built `{ [ActionType.X]: ... }` resolver with
   `createActionProcessor(askX, getProcessX)`. Keep the named `getProcessX` function
   (project rule: no multi-line logic inline as a call argument).
6. Verify (see below), tick the checkbox here, commit.

## Patterns

- **Plain action**: definition object only. Most items.
- **Payload-less**: omit `getPayload` (see askGetRuntimeCorrelation).
- **Requester with logic** (guards, branching, loops), flagged `base + story split`: the
  pure single-yield part becomes `askXBase` via the factory; the exported story keeps the
  natural `askX` name and does `yield* askXBase(...)`. Processors key off `askXBase`.
  See askBatch.
- **Generic return** (`askX<T>(...): AskResponse<T>`), flagged `generic return`: the
  factory cannot produce a per-call generic, so use the base + story split with the base
  returning the widest honest type (`unknown` or `any[]`) and a small generic story that
  casts: `return (yield* askXBase(...)) as T;`. askBatch is the worked example.
- **Companion stories in the same file** (askFileListAllDirectory, askLog and friends):
  ordinary stories built on the base requester. They keep their `AskResponse<T>` types and
  need no structural change beyond calling the converted requester.
- **Event lifecycle actions** (the `event/` domain): implemented once per event source in
  awslambda (~18 files each) plus dev-server and webserver overrides. Big fan-out, same
  mechanical change per file. Do these late, one action across all its processors per
  commit.
- **No processor found**: the flag means the scan found no `get*ActionProcessor.ts` with a
  matching name. The action may be processed under a different file name, registered
  dynamically, or be a story that never had its own processor. Grep the ActionType member
  before deciding anything.
- **Anything unusual: skip it.** If an item does not cleanly fit the patterns above, do
  not force it and do not invent a new pattern. Leave the box unticked, add a short note
  on the item saying what you found and why it was skipped, commit the note, and move on
  to the next item. Skipped items get reviewed by hand later.

## Verification

Before every commit, from the repo root:

```bash
npm run build:lite   # builds the packages changed since the last build (also typechecks them)
npm run test:lite    # runs the tests affected by the changes
```

Both must pass. If either fails, fix it before committing; never commit red and move on.
Building the changed packages also means downstream packages typecheck against fresh libs
rather than stale ones.

## Commit convention

One checklist item per commit. Message format:

```
askConfigGetApplicationInfo: migrate to action factory
```

The same commit must tick the item's checkbox in this file (and add a note on the item if
you discovered something worth recording, e.g. "pure story, no processor"). A skipped
item commits only its note in this file, with a message like
`askWhatever: skipped, <short reason>`.

## Checklist

### quidproquo-actionprocessor-awslambda

#### actions

- [ ] **askGraphDatabaseForNeptuneGetEndpoints** `quidproquo-actionprocessor-awslambda/src/getActionProcessor/core/graphDatabase/customActions/actions/GraphDatabaseForNeptuneGetEndpointsActionRequester.ts` · processors: actionprocessor-awslambda

### quidproquo-core

#### ai

- [x] **askAiPrompt** `quidproquo-core/src/actions/ai/askAiPrompt.ts` · processors: actionprocessor-awslambda
- [x] **askAiPromptStream** `quidproquo-core/src/actions/ai/askAiPromptStream.ts` · processors: actionprocessor-awslambda

#### claudeAi

- [x] **askClaudeAiMessagesApi** `quidproquo-core/src/actions/claudeAi/askClaudeAiMessagesApi.ts` · processors: actionprocessor-js

#### config

- [x] **askConfigGetApplicationInfo** `quidproquo-core/src/actions/config/askConfigGetApplicationInfo.ts` · processors: actionprocessor-js
- [x] **askConfigGetGlobal** `quidproquo-core/src/actions/config/askConfigGetGlobal.ts` · processors: actionprocessor-js · generic return: base + casting story
- [x] **askConfigGetParameter** `quidproquo-core/src/actions/config/askConfigGetParameter.ts` · processors: actionprocessor-awslambda, actionprocessor-web, dev-server
- [x] **askConfigGetParameters** `quidproquo-core/src/actions/config/askConfigGetParameters.ts` · processors: actionprocessor-awslambda, actionprocessor-web, dev-server
- [x] **askConfigGetSecret** `quidproquo-core/src/actions/config/askConfigGetSecret.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askConfigListParameters** `quidproquo-core/src/actions/config/askConfigListParameters.ts` · processors: actionprocessor-awslambda
- [x] **askConfigSetParameter** `quidproquo-core/src/actions/config/askConfigSetParameter.ts` · processors: actionprocessor-awslambda, actionprocessor-web, dev-server

#### context

- [x] **askContextRead** `quidproquo-core/src/actions/context/askContextRead.ts` · processors: actionprocessor-js · generic return: base + casting story

#### crypto

- [x] **askCryptoDecrypt** `quidproquo-core/src/actions/crypto/askCryptoDecrypt.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askCryptoEncrypt** `quidproquo-core/src/actions/crypto/askCryptoEncrypt.ts` · processors: actionprocessor-awslambda, dev-server

#### date

- [x] **askDateNow** `quidproquo-core/src/actions/date/askDateNow.ts` · processors: actionprocessor-js

#### dynamicFunctions

- [x] **askDynamicFunctionExecute** `quidproquo-core/src/actions/dynamicFunctions/askDynamicFunctionExecute.ts` · processors: actionprocessor-node · generic return: base + casting story

#### error

- [x] **askThrowError** `quidproquo-core/src/actions/error/askThrowError.ts` · processors: actionprocessor-js · generic return: base + casting story

#### event

- [x] **askEventAutoRespond** `quidproquo-core/src/actions/event/askEventAutoRespond.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventGetRecords** `quidproquo-core/src/actions/event/askEventGetRecords.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventGetStorySession** `quidproquo-core/src/actions/event/askEventGetStorySession.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventMatchStory** `quidproquo-core/src/actions/event/askEventMatchStory.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventResolveCaughtError** `quidproquo-core/src/actions/event/askEventResolveCaughtError.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventTransformEventParams** `quidproquo-core/src/actions/event/askEventTransformEventParams.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventTransformEventRecord** `quidproquo-core/src/actions/event/askEventTransformEventRecord.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventTransformEventRecordResponse** `quidproquo-core/src/actions/event/askEventTransformEventRecordResponse.ts` · base is source-agnostic; each per-source processor narrows at its handler
- [x] **askEventTransformResponseResult** `quidproquo-core/src/actions/event/askEventTransformResponseResult.ts` · base is source-agnostic; each per-source processor narrows at its handler

#### eventBus

- [x] **askEventBusSendMessages** `quidproquo-core/src/actions/eventBus/askEventBusSendMessages.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story

#### file

- [x] **askFileDelete** `quidproquo-core/src/actions/file/askFileDelete.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileExists** `quidproquo-core/src/actions/file/askFileExists.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileGenerateTemporarySecureUrl** `quidproquo-core/src/actions/file/askFileGenerateTemporarySecureUrl.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileGenerateTemporaryUploadSecureUrl** `quidproquo-core/src/actions/file/askFileGenerateTemporaryUploadSecureUrl.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileIsColdStorage** `quidproquo-core/src/actions/file/askFileIsColdStorage.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileListDirectory** / **askFileListAllDirectory** `quidproquo-core/src/actions/file/askFileListDirectory.ts` · processors: actionprocessor-awslambda, actionprocessor-node · has logic: base + story split
- [x] **askFileReadBinaryContents** `quidproquo-core/src/actions/file/askFileReadBinaryContents.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileReadObjectJson** `quidproquo-core/src/actions/file/askFileReadObjectJson.ts` · processors: actionprocessor-awslambda, actionprocessor-node · generic return: base + casting story
- [x] **askFileReadTextContents** `quidproquo-core/src/actions/file/askFileReadTextContents.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileStreamOpen** `quidproquo-core/src/actions/file/askFileStreamOpen.ts` · processors: actionprocessor-awslambda, actionprocessor-node · generic return: base + casting story
- [x] **askFileWriteBinaryContents** `quidproquo-core/src/actions/file/askFileWriteBinaryContents.ts` · processors: actionprocessor-awslambda, actionprocessor-node
- [x] **askFileWriteObjectJson** `quidproquo-core/src/actions/file/askFileWriteObjectJson.ts` · processors: actionprocessor-awslambda, actionprocessor-node · generic return: base + casting story
- [x] **askFileWriteTextContents** `quidproquo-core/src/actions/file/askFileWriteTextContents.ts` · processors: actionprocessor-awslambda, actionprocessor-node

#### graphDatabase

- [x] **askGraphDatabaseExecuteOpenCypherQuery** `quidproquo-core/src/actions/graphDatabase/askGraphDatabaseExecuteOpenCypherQuery.ts` · processors: actionprocessor-awslambda, dev-server, neo4j
- [x] **askGraphDatabaseInternalFieldNames** `quidproquo-core/src/actions/graphDatabase/askGraphDatabaseInternalFieldNames.ts` · processors: actionprocessor-awslambda

#### guid

- [x] **askNewGuid** `quidproquo-core/src/actions/guid/askNewGuid.ts` · processors: actionprocessor-js
- [x] **askNewSortableGuid** `quidproquo-core/src/actions/guid/askNewSortableGuid.ts` · processors: actionprocessor-js
- [x] **askNewSortableGuids** `quidproquo-core/src/actions/guid/askNewSortableGuids.ts` · processors: actionprocessor-js

#### inlineFunction

- [x] **askInlineFunctionExecute** `quidproquo-core/src/actions/inlineFunction/askInlineFunctionExecute.ts` · processors: actionprocessor-node · generic return: base + casting story

#### keyValueStore

- [x] **askKeyValueStoreDelete** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreDelete.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askKeyValueStoreGet** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreGet.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreGetAll** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreGetAll.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreQuery** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreQuery.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreScan** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreScan.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreScanAllScopes** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreScanAllScopes.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreUpdate** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreUpdate.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreUpsert** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreUpsert.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story
- [x] **askKeyValueStoreUpsertMany** `quidproquo-core/src/actions/keyValueStore/askKeyValueStoreUpsertMany.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story

#### log

- [x] **askLogCreate** `quidproquo-core/src/actions/log/askLogCreate.ts` · processors: actionprocessor-js, dev-server
- [x] **askLogDisableEventHistory** `quidproquo-core/src/actions/log/askLogDisableEventHistory.ts` · processors: actionprocessor-js, dev-server
- [x] **askLogTemplateLiteral** / **askLog** `quidproquo-core/src/actions/log/askLogTemplateLiteral.ts` · processors: actionprocessor-js, dev-server

#### math

- [x] **askRandomNumber** `quidproquo-core/src/actions/math/askRandomNumber.ts` · processors: actionprocessor-js

#### metric

- [x] **askMetricPut** `quidproquo-core/src/actions/metric/askMetricPut.ts` · processors: actionprocessor-awslambda, actionprocessor-js

#### network

- [x] **askNetworkRequest** `quidproquo-core/src/actions/network/askNetworkRequest.ts` · processors: actionprocessor-js · generic return: base + casting story

#### platform

- [x] **askDelay** `quidproquo-core/src/actions/platform/askDelay.ts` · processors: actionprocessor-js

#### queue

- [x] **askQueueSendMessages** `quidproquo-core/src/actions/queue/askQueueSendMessages.ts` · askQueueSendMessagesUnordered was commented-out dead code, removed · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story

#### state

- [x] **askStateDispatch** `quidproquo-core/src/actions/state/askStateDispatch.ts` · processors: web-react · generic return: base + casting story
- [x] **askStateRead** `quidproquo-core/src/actions/state/askStateRead.ts` · processors: web-react · generic return: base + casting story

#### stream

- [x] **askStreamClose** `quidproquo-core/src/actions/stream/askStreamClose.ts` · processors: actionprocessor-node
- [x] **askStreamRead** `quidproquo-core/src/actions/stream/askStreamRead.ts` · processors: actionprocessor-node · generic return: base + casting story

#### system

- [x] **askBatchBase** / **askBatch** `quidproquo-core/src/actions/system/askBatch.ts` · processors: actionprocessor-js · generic return: base + casting story
- [x] **askExecuteStory** `quidproquo-core/src/actions/system/askExecuteStory.ts` · processors: actionprocessor-awslambda, core · generic return: base + casting story
- [x] **askGetRuntimeCorrelation** `quidproquo-core/src/actions/system/askGetRuntimeCorrelation.ts` · processors: actionprocessor-js
- [x] **askParallelDEPRECATED** `quidproquo-core/src/actions/system/askParallelDEPRECATED.ts` · pure story over askBatch, no action of its own; retyped to AskResponse only
- [x] **askTraceStory** `quidproquo-core/src/actions/system/askTraceStory.ts` · processors: actionprocessor-awslambda, actionprocessor-node

#### userDirectory

- [x] **askUserDirectoryAssociateSoftwareToken** `quidproquo-core/src/actions/userDirectory/askUserDirectoryAssociateSoftwareToken.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryAuthenticateUser** `quidproquo-core/src/actions/userDirectory/askUserDirectoryAuthenticateUser.ts` · processors: actionprocessor-awslambda, dev-server · has logic: base + story split
- [x] **askUserDirectoryChangePassword** `quidproquo-core/src/actions/userDirectory/askUserDirectoryChangePassword.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryConfirmEmailVerification** `quidproquo-core/src/actions/userDirectory/askUserDirectoryConfirmEmailVerification.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryConfirmForgotPassword** `quidproquo-core/src/actions/userDirectory/askUserDirectoryConfirmForgotPassword.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryCreateUser** `quidproquo-core/src/actions/userDirectory/askUserDirectoryCreateUser.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryDecodeAccessToken** `quidproquo-core/src/actions/userDirectory/askUserDirectoryDecodeAccessToken.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryForgotPassword** `quidproquo-core/src/actions/userDirectory/askUserDirectoryForgotPassword.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryGetUserAttributes** `quidproquo-core/src/actions/userDirectory/askUserDirectoryGetUserAttributes.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryGetUserAttributesByUserId** `quidproquo-core/src/actions/userDirectory/askUserDirectoryGetUserAttributesByUserId.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryGetUsers** `quidproquo-core/src/actions/userDirectory/askUserDirectoryGetUsers.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryGetUsersByAttribute** `quidproquo-core/src/actions/userDirectory/askUserDirectoryGetUsersByAttribute.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryReadAccessToken** `quidproquo-core/src/actions/userDirectory/askUserDirectoryReadAccessToken.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryRefreshToken** `quidproquo-core/src/actions/userDirectory/askUserDirectoryRefreshToken.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryRequestEmailVerification** `quidproquo-core/src/actions/userDirectory/askUserDirectoryRequestEmailVerification.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryRespondToAuthChallenge** `quidproquo-core/src/actions/userDirectory/askUserDirectoryRespondToAuthChallenge.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectoryRevokeRefreshToken** `quidproquo-core/src/actions/userDirectory/askUserDirectoryRevokeRefreshToken.ts` · processors: actionprocessor-awslambda
- [x] **askUserDirectorySetAccessToken** `quidproquo-core/src/actions/userDirectory/askUserDirectorySetAccessToken.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectorySetPassword** `quidproquo-core/src/actions/userDirectory/askUserDirectorySetPassword.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectorySetUserAttributes** `quidproquo-core/src/actions/userDirectory/askUserDirectorySetUserAttributes.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askUserDirectorySignOutUser** `quidproquo-core/src/actions/userDirectory/askUserDirectorySignOutUser.ts` · processors: actionprocessor-awslambda

### quidproquo-features

#### eventDocEvent

- [x] **askApplyEventDocEvent** `quidproquo-features/src/eventDoc/actions/eventDocEvent/askApplyEventDocEvent.ts` · generic return: base + casting story · no get*ActionProcessor found: grep the ActionType member
- [x] **askApplyTransientEventDocEvent** `quidproquo-features/src/eventDoc/actions/eventDocEvent/askApplyTransientEventDocEvent.ts` · generic return: base + casting story · no get*ActionProcessor found: grep the ActionType member
- [x] **askEventDocReadIdentity** `quidproquo-features/src/eventDoc/actions/eventDocEvent/askEventDocReadIdentity.ts` · has logic: base + story split · no get*ActionProcessor found: grep the ActionType member
- [x] **askEventDocReadState** `quidproquo-features/src/eventDoc/actions/eventDocEvent/askEventDocReadState.ts` · has logic: base + story split · no get*ActionProcessor found: grep the ActionType member

#### service

- [x] **askServiceRequest** `quidproquo-features/src/webSocketQueue/logic/service/askServiceRequest.ts` · processors: web-react · generic return: base + casting story

### quidproquo-web

#### queryParams

- [x] **askQueryParamsGet** `quidproquo-web/src/actions/queryParams/askQueryParamsGet.ts` · processors: actionprocessor-web
- [x] **askQueryParamsGetAll** `quidproquo-web/src/actions/queryParams/askQueryParamsGetAll.ts` · processors: actionprocessor-web
- [x] **askQueryParamsSet** `quidproquo-web/src/actions/queryParams/askQueryParamsSet.ts` · processors: actionprocessor-web

#### window

- [x] **askWindowGetLocation** `quidproquo-web/src/actions/window/askWindowGetLocation.ts` · processors: actionprocessor-web

### quidproquo-webserver

#### admin

- [x] **askAdminGetLog** `quidproquo-webserver/src/actions/admin/askAdminGetLog.ts` · no get*ActionProcessor found: grep the ActionType member
- [x] **askAdminGetLogMetadata** `quidproquo-webserver/src/actions/admin/askAdminGetLogMetadata.ts` · no get*ActionProcessor found: grep the ActionType member
- [x] **askAdminGetLogMetadataChildren** `quidproquo-webserver/src/actions/admin/askAdminGetLogMetadataChildren.ts` · no get*ActionProcessor found: grep the ActionType member
- [x] **askAdminGetLogs** `quidproquo-webserver/src/actions/admin/askAdminGetLogs.ts` · no get*ActionProcessor found: grep the ActionType member

#### api

- [x] **askApiRequest** `quidproquo-webserver/src/actions/api/askApiRequest.ts` · generic return: base + casting story · no get*ActionProcessor found: grep the ActionType member

#### apiKeyValidation

- [x] **askApiKeyValidationValidate** `quidproquo-webserver/src/actions/apiKeyValidation/askApiKeyValidationValidate.ts` · processors: actionprocessor-awslambda, dev-server

#### dns

- [x] **askDnsList** `quidproquo-webserver/src/actions/dns/askDnsList.ts` · processors: actionprocessor-js

#### email

- [x] **askEmailSendEmail** `quidproquo-webserver/src/actions/email/askEmailSendEmail.ts` · processors: actionprocessor-awslambda, dev-server
- [x] **askEmailSetDeliveryStatus** `quidproquo-webserver/src/actions/email/askEmailSetDeliveryStatus.ts` · processors: actionprocessor-awslambda, dev-server

#### genericDataResource

- [x] **askPutGenericDataResource** / **askScanGenericDataResource** `quidproquo-webserver/src/actions/genericDataResource/` · split into one file per requester; no processor in this repo

#### openApiSpec

- [x] **askGetOpenApiSpec** `quidproquo-webserver/src/actions/openApiSpec/askGetOpenApiSpec.ts` · no get*ActionProcessor found: grep the ActionType member

#### routeAuthValidation

- [x] **askRouteAuthValidationDecode** `quidproquo-webserver/src/actions/routeAuthValidation/askRouteAuthValidationDecode.ts` · processors: webserver

#### serviceFunction

- [x] **askServiceFunctionExecute** `quidproquo-webserver/src/actions/serviceFunction/askServiceFunctionExecute.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story

#### webEntry

- [x] **askWebEntryInvalidateCache** `quidproquo-webserver/src/actions/webEntry/askWebEntryInvalidateCache.ts` · processors: actionprocessor-awslambda

#### websocket

- [x] **askWebsocketSendMessage** `quidproquo-webserver/src/actions/websocket/askWebsocketSendMessage.ts` · processors: actionprocessor-awslambda, dev-server · generic return: base + casting story

### quidproquo-xstate

#### actions

- [x] **askStateMachineCreate** `quidproquo-xstate/src/actions/askStateMachineCreate.ts` · processors: xstate · generic return: base + casting story
- [x] **askStateMachineGet** `quidproquo-xstate/src/actions/askStateMachineGet.ts` · processors: xstate · generic return: base + casting story
- [x] **askStateMachineGetState** `quidproquo-xstate/src/actions/askStateMachineGetState.ts` · processors: xstate
- [x] **askStateMachineSendEvent** `quidproquo-xstate/src/actions/askStateMachineSendEvent.ts` · processors: xstate · generic return: base + casting story


