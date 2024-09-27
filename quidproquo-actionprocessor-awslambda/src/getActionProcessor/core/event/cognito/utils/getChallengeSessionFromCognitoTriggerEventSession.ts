import { DefineAuthChallengeTriggerEvent } from 'aws-lambda';
import { ChallengeResult, ChallengeSession } from 'quidproquo-core';

export const getChallengeSessionFromCognitoTriggerEventSession = (
  session: DefineAuthChallengeTriggerEvent['request']['session'],
): ChallengeSession => {
  const challengeSession: ChallengeSession = session.map((c) => {
    const result: ChallengeResult = {
      challengeName: c.challengeMetadata || '',
      challengeResult: c.challengeResult,
    };

    return result;
  });

  return challengeSession;
};
