import { AuthenticateUserChallenge } from 'quidproquo-core';

import { AnyChallengePayload, MfaChallengePayload, NewPasswordChallengePayload } from './types';

export const isNewPasswordChallengePayload = (payload: AnyChallengePayload): payload is NewPasswordChallengePayload =>
  payload.challenge === AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED;

export const isMfaChallengePayload = (payload: AnyChallengePayload): payload is MfaChallengePayload =>
  payload.challenge === AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA;
