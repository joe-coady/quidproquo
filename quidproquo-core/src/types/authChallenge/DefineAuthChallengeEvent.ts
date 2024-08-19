export type DefineAuthChallengeEvent = {};

export type DefineAuthChallengeEventResponse = {
  runCreateAuthChallenge: boolean;
  failAuthentication: boolean;
  issueTokens: boolean;
};
