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
