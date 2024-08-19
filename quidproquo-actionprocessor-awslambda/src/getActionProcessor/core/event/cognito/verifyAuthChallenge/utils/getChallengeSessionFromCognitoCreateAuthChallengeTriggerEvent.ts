import { CreateAuthChallengeTriggerEvent } from 'aws-lambda';
import { ChallengeResult, ChallengeSession } from 'quidproquo-core';

export const getChallengeSessionFromCognitoCreateAuthChallengeTriggerEvent = (event: CreateAuthChallengeTriggerEvent): ChallengeSession => {
  const session: ChallengeSession = event.request.session.map((c) => {
    const result: ChallengeResult = {
      challengeName: c.challengeMetadata || '',
      challengeResult: c.challengeResult,
    };

    return result;
  });

  return session;
};
