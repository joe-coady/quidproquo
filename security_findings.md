# Security findings

## create-qpq-app/src/cli/runCreateQpqApp.ts
- **Severity**: low
- **Issue**: The `--domain` value is never validated and is interpolated verbatim into generated source (`packages/constants/src/domain.ts` via `replaceInFileExact`), so a crafted value can inject arbitrary code into the scaffolded app. Only affects the user scaffolding their own app on their own machine, so the practical risk is self-injection only.
- **Where**: `runCreateQpqApp` (domain answer), applied in `steps/006_applyDomain.ts`.
- **Suggested fix**: Validate the domain against a hostname regex (letters, digits, hyphens, dots) before running steps, mirroring the app-name check in `001_preflight.ts`.
- **Status**: recorded

## quidproquo-web/src/services/WebsocketService.ts
- **Severity**: low
- **Issue**: subscribeToEvent JSON.parses server frames and casts straight to the subscriber's event type with no shape validation beyond the `type` field; a compromised or spoofed server can inject arbitrary payload shapes into typed handlers.
- **Where**: subscribeToEvent / forwardMatchingMessage.
- **Suggested fix**: assert an object with an own `type` string property before invoking the typed callback; let consumers pass a payload guard for stronger guarantees.
- **Status**: recorded

## quidproquo-web/src/services/WebsocketService.ts
- **Severity**: low
- **Issue**: pendingMessages grows unboundedly while disconnected and every queued message (potentially auth-bearing frames) is replayed on the next connection with no cap or max-age.
- **Where**: send / onConnect.
- **Suggested fix**: cap the queue length and drop-with-warning past it; consider a non-replayable flag for messages.
- **Status**: recorded

## quidproquo-web/src/services/WebsocketService.ts
- **Severity**: low
- **Issue**: reconnect retries forever with the original constructor url verbatim; a short-lived auth token in the query string gets re-sent indefinitely after expiry and lands repeatedly in server access logs.
- **Where**: reconnectIfNotDestroyed / connect.
- **Suggested fix**: accept a url-provider callback so each reconnect fetches a fresh token, or expose a max-attempts/backoff ceiling.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/logic/dynamo/qpqDynamoOrm/buildDynamoUpdateExpression.ts
- **Severity**: medium
- **Issue**: Attribute path segments that were not strings were interpolated raw into the UpdateExpression; a non-number smuggled through a JSON payload stringifies into the expression, allowing update-expression injection (rewriting which attributes a single update touches).
- **Where**: getNestedItemName (previously in buildDynamoUpdate.ts).
- **Suggested fix**: Only interpolate non-negative integers; throw on everything else.
- **Status**: fixed in this pass (with proving test)

## quidproquo-actionprocessor-awslambda/src/logic/dynamo/utils/stringToLastEvaluatedKey.ts
- **Severity**: low
- **Issue**: Unsafe deserialization of the client-supplied pagination token: base64 JSON.parse with no shape validation or integrity protection. Malformed tokens throw an uncaught SyntaxError; a forged ExclusiveStartKey goes straight to DynamoDB (impact bounded by DynamoDB key-schema validation to the caller's own result set).
- **Where**: stringToLastEvaluatedKey.
- **Suggested fix**: try/catch the decode into a typed "invalid page key" error and validate the decoded shape; optionally HMAC the token.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/logic/dynamo/qpqDynamoOrm/getHash.ts
- **Severity**: low
- **Issue**: Expression placeholders are md5-derived from attribute names/values; an md5 collision between two values in one expression would silently substitute one value for another. Not attacker-practical (colliding inputs are the attacker's own values).
- **Where**: getHash (used by getItemName / getValueName).
- **Suggested fix**: Switch the digest to sha256.
- **Status**: recorded

## quidproquo-xstate/src/actionProcessor/getStateMachineSendEventActionProcessor.ts
- **Severity**: medium
- **Issue**: SendEvent is an unlocked read-modify-write: entity loaded, guards evaluated, can() checked, then the new snapshot upserted with no concurrency control; two concurrent SendEvents can both validate against the same state and last-write-wins (a transition can fire twice, or be lost).
- **Where**: getProcessStateMachineSendEvent.
- **Suggested fix**: optimistic-concurrency condition (version field or condition on stored snapshot) returning Conflict on mismatch; needs KVS conditional-update support, dedicated pass.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/logic/cognito/decodeValidJwt.ts
- **Severity**: high
- **Issue**: JWT verification accepted ID tokens as access tokens: an ID token from the same pool passed signature/JWKS checks and token_use was never checked.
- **Where**: decodeValidJwt.
- **Suggested fix**: check payload.token_use === 'access'.
- **Status**: fixed in this pass (with proving tests)

## quidproquo-actionprocessor-awslambda/src/logic/cognito/decodeValidJwt.ts
- **Severity**: medium
- **Issue**: JWT verification did not pin the issuer claim (defense in depth; signature already pinned to the pool's JWKS).
- **Where**: decodeValidJwt.
- **Suggested fix**: pass issuer to verify().
- **Status**: fixed in this pass (with proving test)

## quidproquo-actionprocessor-awslambda/src/logic/cognito/ (listPagedUsersByAttribute, getUserAttributesBySub, resolveUsernameByPreferredUsername)
- **Severity**: medium
- **Issue**: Cognito ListUsers filter injection: attribute names/values (action payload and login input) interpolated raw into filter strings; embedded quotes could alter or break the filter.
- **Where**: the three filter-building functions.
- **Suggested fix**: validate attribute name, reject unquotable values.
- **Status**: fixed in this pass via buildCognitoUserFilter

## quidproquo-actionprocessor-awslambda/src/logic/cognito/decodeValidJwt.ts
- **Severity**: low
- **Issue**: Tokens from any app client of the pool are accepted: no audience/client_id check (single-client pools today; a second client's tokens would be interchangeable).
- **Where**: decodeValidJwt.
- **Suggested fix**: thread the expected clientId through and check payload.client_id.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/logic/cognito/getUserPoolClientSecret.ts
- **Severity**: low
- **Issue**: DescribeUserPoolClient called on every auth operation; uncached client-secret fetch adds throttling exposure.
- **Where**: getUserPoolClientSecret.
- **Suggested fix**: memoFuncAsync like getSecret (weigh secret-rotation freshness).
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/logic/createAwsClient.ts
- **Severity**: high
- **Issue**: On any AWS SDK error the send wrapper console.logs the full client config AND full command input; command inputs can contain secrets (AdminInitiateAuth passwords, PutParameter values, KMS plaintext, message/email bodies), so a throttle or transient error writes them to CloudWatch.
- **Where**: createAwsClient send wrapper.
- **Suggested fix**: log the command constructor name and error only, or redact input fields.
- **Status**: recorded (deliberate debugging aid, needs a logging-behaviour decision)

## quidproquo-actionprocessor-awslambda/src/logic/s3/generatePresignedUrl.ts / generatePresignedUploadUrl.ts
- **Severity**: low
- **Issue**: expiresIn = expirationMs / 1000 is neither rounded nor bounded; callers control expiry up to the S3 7-day max.
- **Where**: both presign helpers.
- **Suggested fix**: clamp and round the expiry.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/lambdaHandlers/getCloudFrontRequestEvent_viewerRequest.ts
- **Severity**: medium
- **Issue**: Full CloudFront viewer request (all headers including Cookie/Authorization) was logged to CloudWatch on every edge request.
- **Where**: viewerRequestEventHandler.
- **Suggested fix**: remove the log line.
- **Status**: fixed in this pass

## quidproquo-actionprocessor-awslambda/src/lambdaHandlers/getQpqLambdaRuntimeForEvent.ts
- **Severity**: medium
- **Issue**: console.log('tick: ', JSON.stringify(event)) logs the complete triggering event for every lambda; API Gateway events include Authorization headers, cookies and request bodies (potentially passwords on login routes). The S3 story log already captures event args.
- **Where**: getQpqLambdaRuntimeForEvent.
- **Suggested fix**: remove, gate behind a debug env flag, or redact auth headers/cookies.
- **Status**: recorded (possibly deliberate debug aid)

## quidproquo-actionprocessor-awslambda/src/lambdaHandlers/getQpqLambdaRuntimeForEvent.ts
- **Severity**: low
- **Issue**: console.log('Finished, returning: ', result.result) can log response bodies (tokens, user data) to CloudWatch.
- **Where**: same file.
- **Suggested fix**: same treatment as the tick log.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda/src/lambdaHandlers/helpers/isSnsWarmerRecord.ts
- **Severity**: medium
- **Issue**: Unhandled JSON.parse of the untrusted SNS Message field let any publisher able to reach a subscribed topic crash invocations with a non-JSON message (DoS-shaped robustness hole).
- **Where**: warmer detection (previously inline in getQpqLambdaRuntimeForEvent).
- **Suggested fix**: safe parse.
- **Status**: fixed in this pass (with proving tests)

## quidproquo-actionprocessor-awslambda/src/lambdas/dynamicModuleLoader/dynamicModuleLoader.ts
- **Severity**: low
- **Issue**: Loads and executes code from the service's federated code bucket with no integrity check beyond bucket ACLs; write access to the bucket means code execution in every lambda (deploy-time trust boundary, inherent to the design).
- **Where**: dynamicModuleLoader.
- **Suggested fix**: consider signing/hashing the published manifest.
- **Status**: recorded

## quidproquo-actionprocessor-awslambda + quidproquo-deploy-awscdk (warmer sentinel)
- **Severity**: info
- **Issue**: The 'QpqLambdaWarmerEvent' sentinel string is duplicated between isSnsWarmerRecord.ts and BSQpqLambdaWarmerEventConstruct.ts with no shared constant; drift would silently break warm-up.
- **Where**: both files.
- **Suggested fix**: shared constant in core.
- **Status**: recorded
