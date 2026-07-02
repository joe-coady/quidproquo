import {
  AuthenticateUserChallenge,
  AuthenticateUserResponse,
  AuthenticationInfo,
  generateUuidV5,
  UserAttributes,
  UuidNamespace,
} from 'quidproquo-core';

/**
 * Dev server auth helpers.
 *
 * The dev server has no real user directory ~ any username / password combination
 * is accepted and we mint an unsigned JWT for it. The token is a structurally
 * valid JWT so decodeAccessTokenForDev (and anything else that base64-decodes
 * the payload) works, but it carries no real signature.
 *
 * This is ONLY safe for development.
 */

export const DEV_USER_EMAIL = 'devuser@example.com';

const DEV_ACCESS_TOKEN_EXPIRY_SECONDS = 24 * 60 * 60;
const DEV_REFRESH_TOKEN_EXPIRY_SECONDS = 30 * 24 * 60 * 60;

const base64UrlEncode = (value: object): string => Buffer.from(JSON.stringify(value)).toString('base64url');

export const resolveDevUsername = (username?: string | null): string => username || DEV_USER_EMAIL;

// Fixed namespace so userIds stay stable across dev server restarts.
const devUserIdNamespace = generateUuidV5('quidproquo-dev-server/user-id', UuidNamespace.url);

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Derives a deterministic userId from the login, so the same email is always the
// same user in dev. Emails are compared case-insensitively, hence the lowercase.
// A value that is already a userId (e.g. from getUserAttributesByUserId) passes
// through unchanged rather than being re-hashed.
export const createDevUserId = (username?: string | null): string => {
  const resolvedUsername = resolveDevUsername(username);

  if (uuidRegex.test(resolvedUsername)) {
    return resolvedUsername.toLowerCase();
  }

  return generateUuidV5(resolvedUsername.trim().toLowerCase(), devUserIdNamespace);
};

export const createDevJwt = (username?: string | null, expiresInSeconds: number = DEV_ACCESS_TOKEN_EXPIRY_SECONDS): string => {
  const resolvedUsername = resolveDevUsername(username);
  const iat = Math.floor(Date.now() / 1000);

  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    // Like Cognito: sub carries the userId, username/email carry the login
    sub: createDevUserId(resolvedUsername),
    username: resolvedUsername,
    email: resolvedUsername,
    iat,
    exp: iat + expiresInSeconds,
  };

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.dev-signature`;
};

export const createDevAuthResponse = (username?: string | null): AuthenticateUserResponse => {
  const authenticationInfo: AuthenticationInfo = {
    accessToken: createDevJwt(username),
    idToken: createDevJwt(username),
    refreshToken: createDevJwt(username, DEV_REFRESH_TOKEN_EXPIRY_SECONDS),
    expirationDurationInSeconds: DEV_ACCESS_TOKEN_EXPIRY_SECONDS,
    expiresAt: new Date(Date.now() + DEV_ACCESS_TOKEN_EXPIRY_SECONDS * 1000).toISOString(),
    tokenType: 'Bearer',
  };

  return {
    challenge: AuthenticateUserChallenge.NONE,
    authenticationInfo,
  };
};

export const createDevUserAttributes = (usernameOrUserId?: string | null): UserAttributes => {
  const resolved = resolveDevUsername(usernameOrUserId);

  // A userId can't be reversed back to its email and the dev server keeps no
  // user store, so lookups by userId fall back to the dev user email.
  const isUserId = uuidRegex.test(resolved);

  return {
    userId: createDevUserId(resolved),
    email: isUserId ? DEV_USER_EMAIL : resolved,
    emailVerified: true,
  };
};
