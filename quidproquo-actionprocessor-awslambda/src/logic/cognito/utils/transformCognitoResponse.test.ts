import { AuthenticateUserChallenge } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';
import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';

import {
  cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo,
  cognitoAuthenticationResultTypeToQpqAuthenticationInfo,
  cognitoChallengeNameTypeToQpqAuthenticateUserChallenge,
} from './transformCognitoResponse';

describe('cognitoAuthenticationResultTypeToQpqAuthenticationInfo', () => {
  it('maps token fields and computes expiresAt from the issue time plus ExpiresIn', () => {
    const info = cognitoAuthenticationResultTypeToQpqAuthenticationInfo(
      { AccessToken: 'access', IdToken: 'id', RefreshToken: 'refresh', TokenType: 'Bearer', ExpiresIn: 3600 },
      '2026-01-01T00:00:00.000Z',
    );

    expect(info).toEqual({
      accessToken: 'access',
      idToken: 'id',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expirationDurationInSeconds: 3600,
      expiresAt: '2026-01-01T01:00:00.000Z',
    });
  });

  it('treats a missing ExpiresIn as a zero-second offset', () => {
    const info = cognitoAuthenticationResultTypeToQpqAuthenticationInfo({ AccessToken: 'access' }, '2026-01-01T00:00:00.000Z');

    expect(info.expiresAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('cognitoChallengeNameTypeToQpqAuthenticateUserChallenge', () => {
  it('returns NONE when no challenge is supplied', () => {
    expect(cognitoChallengeNameTypeToQpqAuthenticateUserChallenge(undefined)).toBe(AuthenticateUserChallenge.NONE);
  });

  it.each([
    [ChallengeNameType.NEW_PASSWORD_REQUIRED, AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED],
    [ChallengeNameType.CUSTOM_CHALLENGE, AuthenticateUserChallenge.CUSTOM_CHALLENGE],
    [ChallengeNameType.SOFTWARE_TOKEN_MFA, AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA],
    [ChallengeNameType.MFA_SETUP, AuthenticateUserChallenge.MFA_SETUP],
  ])('maps %s to %s', (cognitoChallenge: ChallengeNameType, qpqChallenge: AuthenticateUserChallenge) => {
    expect(cognitoChallengeNameTypeToQpqAuthenticateUserChallenge(cognitoChallenge)).toBe(qpqChallenge);
  });

  it('returns a not-implemented marker for an unmapped challenge', () => {
    expect(cognitoChallengeNameTypeToQpqAuthenticateUserChallenge('SMS_MFA')).toBe('QPQ-NOT-IMP-SMS_MFA');
  });
});

describe('cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo', () => {
  it('passes through the session, challenge and challenge parameters', () => {
    const res = cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(
      { Session: 'sess', ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED, ChallengeParameters: { USERNAME: 'a' } },
      '2026-01-01T00:00:00.000Z',
    );

    expect(res).toEqual({
      session: 'sess',
      challenge: AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED,
      challengeParameters: { USERNAME: 'a' },
    });
  });

  it('includes authenticationInfo when an AuthenticationResult is present', () => {
    const res = cognitoAdminInitiateAuthResponseToQpqAuthenticationInfo(
      { AuthenticationResult: { AccessToken: 'access', ExpiresIn: 60 } },
      '2026-01-01T00:00:00.000Z',
    );

    expect(res.challenge).toBe(AuthenticateUserChallenge.NONE);
    expect(res.authenticationInfo?.accessToken).toBe('access');
    expect(res.authenticationInfo?.expiresAt).toBe('2026-01-01T00:01:00.000Z');
  });
});
