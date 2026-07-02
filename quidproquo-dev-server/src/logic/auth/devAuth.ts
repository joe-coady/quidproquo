import { AuthenticateUserChallenge, AuthenticateUserResponse, AuthenticationInfo, UserAttributes } from 'quidproquo-core';

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

export const createDevJwt = (username?: string | null, expiresInSeconds: number = DEV_ACCESS_TOKEN_EXPIRY_SECONDS): string => {
  const resolvedUsername = resolveDevUsername(username);
  const iat = Math.floor(Date.now() / 1000);

  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: resolvedUsername,
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

export const createDevUserAttributes = (username?: string | null): UserAttributes => {
  const resolvedUsername = resolveDevUsername(username);

  return {
    userId: resolvedUsername,
    email: resolvedUsername,
    emailVerified: true,
  };
};
