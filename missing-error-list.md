# Missing error-handling pattern — checklist

Tracks action requesters in `quidproquo-core` that still need the
`createErrorEnumForAction` (requester side) + `actionResultErrorFromCaughtError`
(processor side) pattern.

**Action vs story.** An **action** does `return yield { type: SomeActionType.X, payload }`
with its own `ActionType` and has a platform processor — that processor is where
calls throw and named errors must be mapped, so the pattern applies. A **story**
composes other `ask*` functions (via `yield*`) and has **no processor of its own**,
so there is nothing to map. Stories are listed at the bottom and excluded.

Check an item when both halves are done: the error enum on the requester **and**
the `actionResultErrorFromCaughtError` map in **every `quidproquo-actionprocessor-*`
package that implements the action**. (The `quidproquo-dev-server` is not a target —
it just consumes these processors, so it benefits automatically.)

---

## How to work this list

Work the **"Needs the pattern"** section top to bottom, **one action at a time** —
finish an item completely (and commit it) before starting the next. Do **not**
batch several actions into one change.

For each `[ ]` item:

1. **Open the requester file** (the path on the line). Add the error enum above
   the `ask*` function, listing only the failures a caller would branch on:
   ```ts
   import { createErrorEnumForAction } from '../../types';
   export const <Name>ErrorTypeEnum = createErrorEnumForAction(<ActionType>.<X>, [
     'SomeError',
     'AnotherError',
   ]);
   ```
   Always write the values array multiline — **one enum value per line**, even
   when there is only one — so additions stay one-line diffs. Give every value a
   short trailing `//` comment saying what it means (one line, terse):
   ```ts
   [
     'x', // what x means
     'y', // what y means
   ]
   ```
2. **Find every processor for that action** and add the catch mapping. Search the
   processor packages for the action's type
   (`grep -rl "<ActionType>.<X>" quidproquo-actionprocessor-*/src`). An action may
   be implemented in more than one package (`awslambda`, `node`, `js`, `web`) —
   update **each** one that has it, with the same enum and equivalent handlers
   (the AWS error names differ per platform, e.g. S3 SDK vs. local `fs`). Wrap the
   platform call:
   ```ts
   } catch (error) {
     return actionResultErrorFromCaughtError(error, {
       AwsErrorName: () => actionResultError(<Name>ErrorTypeEnum.SomeError, '...'),
     });
   }
   ```
   **The map keys on `error.code` first, then `error.name`** — both live in the
   same flat map and never collide (a node error's `name` is the useless generic
   `'Error'`, while its meaningful identifier is `error.code`). So the node `fs`
   processors map the OS code directly — no more `if (error.code === 'EACCES')`
   ladders — alongside the AWS SDK `name` handlers:
   ```ts
   } catch (error) {
     return actionResultErrorFromCaughtError(error, {
       EACCES: () => actionResultError(<Name>ErrorTypeEnum.AccessDenied, '...'), // node fs code
       AccessDenied: () => actionResultError(<Name>ErrorTypeEnum.AccessDenied, '...'), // AWS SDK name
     });
   }
   ```
3. **Don't guess the AWS error names.** Map the ones you know; everything else
   already falls through to `GenericError` with `[<code ?? name>]` in the message
   (`processAction.ts` is the universal safety net). Run the path, watch for
   `[SomeException]` / `[ENOENT]` in the result, and promote real keys as they
   show up.
4. **Build** the touched packages (`npm run build -w <package>`) and tick the box.
5. **Commit** that single action, then move to the next item.

**Reference implementations to copy from:**
- Requester side — `quidproquo-core/src/actions/keyValueStore/KeyValueStoreUpsertActionRequester.ts`
- Processor side (fullest) — `quidproquo-actionprocessor-awslambda/src/getActionProcessor/webserver/extract/getExtractExpenseActionProcessor.ts`
- Processor side (core) — `quidproquo-actionprocessor-awslambda/src/getActionProcessor/core/keyValueStore/getKeyValueStoreUpsertActionProcessor.ts`

**Other sections:** "Verify the processor first" items need a look at the processor
before deciding (some make no external call — if so, move them to N/A and skip).
"N/A" and "Stories & orchestration" items need **no work** — they're recorded only
so the list is complete. "Already implemented" is done.

---

## Needs the pattern — external / platform IO (priority)

These processors call AWS / HTTP / external services and can throw named errors.

### Config (external — SSM / Secrets Manager)
- [x] askConfigGetSecret — quidproquo-core/src/actions/config/ConfigGetSecretActionRequester.ts
- [x] askConfigSetParameter — quidproquo-core/src/actions/config/ConfigSetParameterActionRequester.ts

### File / storage (S3)
- [x] askFileDelete — quidproquo-core/src/actions/file/FileDeleteActionRequester.ts
- [x] askFileExists — quidproquo-core/src/actions/file/FileExistsActionRequester.ts
- [x] askFileGenerateTemporarySecureUrl — quidproquo-core/src/actions/file/FileGenerateTemporarySecureUrlActionRequester.ts
- [x] askFileGenerateTemporaryUploadSecureUrl — quidproquo-core/src/actions/file/FileGenerateTemporaryUploadSecureUrlActionRequester.ts
- [x] askFileIsColdStorage — quidproquo-core/src/actions/file/FileIsColdStorageActionRequester.ts
- [x] askFileListDirectory — quidproquo-core/src/actions/file/FileListDirectoryActionRequester.ts
- [x] askFileReadBinaryContents — quidproquo-core/src/actions/file/FileReadBinaryContentsActionRequester.ts
- [x] askFileStreamOpen — quidproquo-core/src/actions/file/FileStreamOpenRequester.ts
- [x] askFileWriteBinaryContents — quidproquo-core/src/actions/file/FileWriteBinaryContentsActionRequester.ts
- [x] askFileWriteObjectJson — quidproquo-core/src/actions/file/FileWriteObjectJsonActionRequester.ts
- [x] askFileWriteTextContents — quidproquo-core/src/actions/file/FileWriteTextContentsActionRequester.ts

### Key-Value Store (DynamoDB)
- [x] askKeyValueStoreDelete — quidproquo-core/src/actions/keyValueStore/KeyValueStoreDeleteActionRequester.ts
- [x] askKeyValueStoreGet — quidproquo-core/src/actions/keyValueStore/KeyValueStoreGetActionRequester.ts
- [x] askKeyValueStoreGetAll — quidproquo-core/src/actions/keyValueStore/KeyValueStoreGetAllActionRequester.ts
- [ ] askKeyValueStoreQuery — quidproquo-core/src/actions/keyValueStore/KeyValueStoreQueryActionRequester.ts
- [ ] askKeyValueStoreScan — quidproquo-core/src/actions/keyValueStore/KeyValueStoreScanActionRequester.ts
- [ ] askKeyValueStoreUpdate — quidproquo-core/src/actions/keyValueStore/KeyValueStoreUpdateActionRequester.ts

### Event Bus / Queue (SNS / EventBridge / SQS)
- [ ] askEventBusSendMessages — quidproquo-core/src/actions/eventBus/EventBusSendMessageActionRequester.ts
- [ ] askQueueSendMessages — quidproquo-core/src/actions/queue/QueueSendMessageActionRequester.ts

### Network (HTTP)
- [ ] askNetworkRequest — quidproquo-core/src/actions/network/NetworkRequestActionRequester.ts

### Stream
- [ ] askStreamClose — quidproquo-core/src/actions/stream/StreamCloseRequester.ts
- [ ] askStreamRead — quidproquo-core/src/actions/stream/StreamReadRequester.ts

### User Directory (Cognito)
- [ ] askUserDirectoryChangePassword — quidproquo-core/src/actions/userDirectory/UserDirectoryChangePasswordActionRequester.ts
- [ ] askUserDirectoryConfirmEmailVerification — quidproquo-core/src/actions/userDirectory/UserDirectoryConfirmEmailVerificationActionRequester.ts
- [ ] askUserDirectoryConfirmForgotPassword — quidproquo-core/src/actions/userDirectory/UserDirectoryConfirmForgotPasswordActionRequester.ts
- [ ] askUserDirectoryCreateUser — quidproquo-core/src/actions/userDirectory/UserDirectoryCreateUserActionRequester.ts
- [ ] askUserDirectoryForgotPassword — quidproquo-core/src/actions/userDirectory/UserDirectoryForgotPasswordActionRequester.ts
- [ ] askUserDirectoryGetUserAttributesByUserId — quidproquo-core/src/actions/userDirectory/UserDirectoryGetUserAttributesByUserIdActionRequester.ts
- [ ] askUserDirectoryGetUsers — quidproquo-core/src/actions/userDirectory/UserDirectoryGetUsersActionRequester.ts
- [ ] askUserDirectoryGetUsersByAttribute — quidproquo-core/src/actions/userDirectory/UserDirectoryGetUsersByAttributeActionRequester.ts
- [ ] askUserDirectoryRefreshToken — quidproquo-core/src/actions/userDirectory/UserDirectoryRefreshTokenActionRequester.ts
- [ ] askUserDirectoryRequestEmailVerification — quidproquo-core/src/actions/userDirectory/UserDirectoryRequestEmailVerificationActionRequester.ts
- [ ] askUserDirectoryRespondToAuthChallenge — quidproquo-core/src/actions/userDirectory/UserDirectoryRespondToAuthChallengeActionRequester.ts
- [ ] askUserDirectorySetPassword — quidproquo-core/src/actions/userDirectory/UserDirectorySetPasswordActionRequester.ts
- [ ] askUserDirectorySetUserAttributes — quidproquo-core/src/actions/userDirectory/UserDirectorySetUserAttributesActionRequester.ts

### AI (moved down)
- [ ] askAiPrompt — quidproquo-core/src/actions/ai/AiPromptActionRequester.ts
- [ ] askAiPromptStream — quidproquo-core/src/actions/ai/AiPromptStreamActionRequester.ts
- [ ] askClaudeAiMessagesApi — quidproquo-core/src/actions/claudeAi/ClaudeAiMessagesApiRequester.ts

---

## Verify the processor first — borderline

May or may not make a fallible external call depending on the processor. Confirm
before implementing or skipping.

- [ ] askInlineFunctionExecute — quidproquo-core/src/actions/inlineFunction/InlineFunctionExecuteActionRequester.ts — invokes a function (local vs. remote lambda?)
- [ ] askConfigGetGlobal — quidproquo-core/src/actions/config/ConfigGetGlobalActionRequester.ts — likely resolved from in-memory config, not SSM
- [ ] askConfigGetApplicationInfo — quidproquo-core/src/actions/config/ConfigGetApplicationInfoActionRequester.ts — likely in-memory / env
- [ ] askUserDirectoryDecodeAccessToken — quidproquo-core/src/actions/userDirectory/UserDirectoryDecodeAccessTokenActionRequester.ts — local JWT decode (may fetch JWKS to verify?)
- [ ] askExecuteStory — quidproquo-core/src/actions/system/SystemExecuteStoryActionRequester.ts — system action; may invoke a runtime/lambda

---

## N/A — pure / in-memory (nothing fallible to map)

Processors do no external call, so there is no named error to translate.

- askContextRead — quidproquo-core/src/actions/context/ContextReadActionRequester.ts
- askDateNow — quidproquo-core/src/actions/date/DateNowActionRequester.ts
- askThrowError — quidproquo-core/src/actions/error/ErrorThrowErrorActionRequester.ts (this *is* the throw mechanism)
- askNewGuid — quidproquo-core/src/actions/guid/GuidNewActionRequester.ts
- askNewSortableGuid — quidproquo-core/src/actions/guid/GuidNewSortableActionRequester.ts
- askRandomNumber — quidproquo-core/src/actions/math/MathRandomNumberActionRequester.ts
- askDelay — quidproquo-core/src/actions/platform/PlatformDelayActionRequester.ts
- askStateDispatch — quidproquo-core/src/actions/state/StateDispatchActionRequester.ts
- askStateRead — quidproquo-core/src/actions/state/StateReadActionRequester.ts
- askLogCreate — quidproquo-core/src/actions/log/LogCreateActionRequester.ts
- askLogDisableEventHistory — quidproquo-core/src/actions/log/LogDisableEventHistoryActionRequester.ts
- askLogTemplateLiteral — quidproquo-core/src/actions/log/LogTemplateLiteralActionRequester.ts
- askUserDirectoryReadAccessToken — quidproquo-core/src/actions/userDirectory/UserDirectoryReadAccessTokenActionRequester.ts (reads token from context)
- askUserDirectorySetAccessToken — quidproquo-core/src/actions/userDirectory/UserDirectorySetAccessTokenActionRequester.ts (sets token in context)

### Event domain — internal transforms (N/A)

Shape the incoming lambda event in-process; no external SDK call.

- askEventAutoRespond — quidproquo-core/src/actions/event/EventAutoRespondActionRequester.ts
- askEventGetRecords — quidproquo-core/src/actions/event/EventGetRecordsActionRequester.ts
- askEventGetStorySession — quidproquo-core/src/actions/event/EventGetStorySessionActionRequester.ts
- askEventMatchStory — quidproquo-core/src/actions/event/EventMatchStoryActionRequester.ts
- askEventResolveCaughtError — quidproquo-core/src/actions/event/EventResolveCaughtErrorActionRequester.ts
- askEventTransformEventParams — quidproquo-core/src/actions/event/EventTransformEventParamsActionRequester.ts
- askEventTransformEventRecord — quidproquo-core/src/actions/event/EventTransformEventRecordActionRequester.ts
- askEventTransformEventRecord (response) — quidproquo-core/src/actions/event/EventTransformEventRecordResponseActionRequester.ts
- askEventTransformResponseResult — quidproquo-core/src/actions/event/EventTransformResponseResultActionRequester.ts

---

## Stories & orchestration — not actions (excluded)

Compose other `ask*` functions; no processor of their own.

- askFileListAllDirectory — quidproquo-core/src/actions/file/FileListDirectoryActionRequester.ts (loops askFileListDirectory)
- askParallelDEPRECATED — quidproquo-core/src/actions/system/SystemRunParallelActionRequester.ts (deprecated; composes stories — file notes system actions have no platform processors)
- askBatch — quidproquo-core/src/actions/system/SystemBatchActionRequester.ts (batches other actions)

---

## Already implemented ✓ (reference)

- [x] askConfigGetParameter — quidproquo-core/src/actions/config/ConfigGetParameterActionRequester.ts
- [x] askConfigGetParameters — quidproquo-core/src/actions/config/ConfigGetParametersActionRequester.ts
- [x] askConfigListParameters — quidproquo-core/src/actions/config/ConfigListParametersActionRequester.ts
- [x] askFileReadObjectJson — quidproquo-core/src/actions/file/FileReadObjectJsonActionRequester.ts
- [x] askFileReadTextContents — quidproquo-core/src/actions/file/FileReadTextContentsActionRequester.ts
- [x] askGraphDatabaseExecuteOpenCypherQuery — quidproquo-core/src/actions/graphDatabase/GraphDatabaseExecuteOpenCypherQueryActionRequester.ts
- [x] askGraphDatabaseInternalFieldNames — quidproquo-core/src/actions/graphDatabase/GraphDatabaseInternalFieldNamesActionRequester.ts
- [x] askKeyValueStoreUpsert — quidproquo-core/src/actions/keyValueStore/KeyValueStoreUpsertActionRequester.ts
- [x] askUserDirectoryAuthenticateUser — quidproquo-core/src/actions/userDirectory/UserDirectoryAuthenticateUserActionRequester.ts
- [x] askUserDirectoryGetUserAttributes — quidproquo-core/src/actions/userDirectory/UserDirectoryGetUserAttributesActionRequester.ts
