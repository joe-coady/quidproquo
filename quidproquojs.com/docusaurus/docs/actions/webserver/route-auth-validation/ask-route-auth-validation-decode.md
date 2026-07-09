---
title: askRouteAuthValidationDecode
description: Decode and validate a route's incoming auth token against its route auth settings, returning the decoded access token.
---

# askRouteAuthValidationDecode

Decodes and validates the **auth token on an incoming HTTP request** against a route's auth settings, and returns the decoded access token (or `null` when there is no valid token). This is the action the webserver runs to authenticate a route before its handler story executes; the decoding is driven by the service's auth system (see `defineAuthSystem`).

- **Action type:** `RouteAuthValidationActionType.Decode`

```typescript
import { askRouteAuthValidationDecode } from 'quidproquo-webserver';

export function* askAuthenticateRequest(event, routeAuthSettings) {
  const decoded = yield* askRouteAuthValidationDecode(event, routeAuthSettings, false);

  if (!decoded || !decoded.wasValid) {
    // no token, or token failed validation
    return null;
  }

  return decoded; // { userId, username, roles, ... }
}
```

## Signature

```typescript
function* askRouteAuthValidationDecode(
  event: HTTPEvent,
  routeAuthSettings: RouteAuthSettings,
  ignoreExpiration: boolean,
): AskResponse<DecodedAccessToken | null>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `event` | `HTTPEvent` | The incoming HTTP request event carrying the auth token (typically a bearer token in the headers). |
| `routeAuthSettings` | `RouteAuthSettings` | The route's auth settings — `userDirectoryName`, `scopes`, `apiKeys` — used to decide which user directory the token is validated against. See [defineRoute](../../../config/webserver/route.md). |
| `ignoreExpiration` | `boolean` | When `true`, an expired token is still decoded (its `wasValid` reflects other checks). When `false`, expiration is enforced. |

## Returns

`DecodedAccessToken | null` — `null` when there is no token to decode. Otherwise the decoded token:

```typescript
interface DecodedAccessToken {
  userId: string;
  username: string;
  exp: number;          // expiry, Unix timestamp in seconds
  roles?: string[];
  userDirectory: string;
  wasValid: boolean;    // whether the token passed validation
}
```

Always check `wasValid` — a token can be decoded but still have failed validation.

## Related

- [defineRoute](../../../config/webserver/route.md) — declares the `routeAuthSettings` this action validates against.
- [askUserDirectoryDecodeAccessToken](../../core/user-directory/ask-user-directory-decode-access-token.md) — the underlying user-directory token decode.
