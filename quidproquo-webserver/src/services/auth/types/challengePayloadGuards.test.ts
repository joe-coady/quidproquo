import { AuthenticateUserChallenge } from 'quidproquo-core';

import { describe, expect, it } from 'vitest';

import { isMfaChallengePayload, isMfaSetupChallengePayload, isNewPasswordChallengePayload } from './challengePayloadGuards';
import { AnyChallengePayload } from './types';

const payloadFor = (challenge: AuthenticateUserChallenge): AnyChallengePayload =>
  ({ email: 'a@b.com', session: 's', challenge }) as AnyChallengePayload;

describe('challengePayloadGuards', () => {
  it.each([
    [AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED, isNewPasswordChallengePayload],
    [AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA, isMfaChallengePayload],
    [AuthenticateUserChallenge.MFA_SETUP, isMfaSetupChallengePayload],
  ])('matches %s with its own guard', (challenge: AuthenticateUserChallenge, guard: (payload: AnyChallengePayload) => boolean) => {
    expect(guard(payloadFor(challenge))).toBe(true);
  });

  it.each([
    [AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA, isNewPasswordChallengePayload],
    [AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED, isMfaChallengePayload],
    [AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA, isMfaSetupChallengePayload],
  ])('rejects %s with a different guard', (challenge: AuthenticateUserChallenge, guard: (payload: AnyChallengePayload) => boolean) => {
    expect(guard(payloadFor(challenge))).toBe(false);
  });
});
