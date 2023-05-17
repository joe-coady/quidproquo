import { AuthenticateUserChallenge } from '../AuthenticateUserChallenge';

export interface AuthChallengeBase {
  challenge: AuthenticateUserChallenge;
  session: string;
}
