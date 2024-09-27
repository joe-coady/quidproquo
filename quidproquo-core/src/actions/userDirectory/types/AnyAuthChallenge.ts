import { AuthenticateUserCustomChallengeChallenge, AuthenticateUserNewPasswordRequiredChallenge } from './AuthChallenges';

export type AnyAuthChallenge = AuthenticateUserNewPasswordRequiredChallenge | AuthenticateUserCustomChallengeChallenge<any>;
