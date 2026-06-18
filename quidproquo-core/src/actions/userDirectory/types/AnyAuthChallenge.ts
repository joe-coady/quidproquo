import {
  AuthenticateUserCustomChallengeChallenge,
  AuthenticateUserNewPasswordRequiredChallenge,
  AuthenticateUserSoftwareTokenMfaChallenge,
} from './AuthChallenges';

export type AnyAuthChallenge =
  | AuthenticateUserNewPasswordRequiredChallenge
  | AuthenticateUserCustomChallengeChallenge<any>
  | AuthenticateUserSoftwareTokenMfaChallenge;
