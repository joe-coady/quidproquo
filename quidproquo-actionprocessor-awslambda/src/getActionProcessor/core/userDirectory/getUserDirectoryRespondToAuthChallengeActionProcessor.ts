import {
  UserDirectoryRespondToAuthChallengeActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AnyAuthChallenge,
  AuthenticateUserChallenge,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig, getCFExportNameUserPoolClientIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

import { respondToAuthChallengeChallenge } from '../../../logic/cognito/respondToAuthChallengeChallenge';
import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';

const anyAuthChallengeToCognitoAttributes = (authChallenge: AnyAuthChallenge): Record<string, string> => {
  switch (authChallenge.challenge) {
    case AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED:
      return {
        NEW_PASSWORD: authChallenge.newPassword,
      };

    case AuthenticateUserChallenge.CUSTOM_CHALLENGE:
      return {
        ANSWER: JSON.stringify(authChallenge.challengeAnswer),
      };

    default:
      return {};
  }
};

const anyAuthChallengeToCognitoChallengeName = (authChallenge: AnyAuthChallenge): ChallengeNameType => {
  switch (authChallenge.challenge) {
    case AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED:
      return ChallengeNameType.NEW_PASSWORD_REQUIRED;

    case AuthenticateUserChallenge.CUSTOM_CHALLENGE:
      return ChallengeNameType.CUSTOM_CHALLENGE;

    default:
      throw new Error(`Unknown challenge`);
  }
};

const getUserDirectoryRespondToAuthChallengeActionProcessor = (qpqConfig: QPQConfig): UserDirectoryRespondToAuthChallengeActionProcessor => {
  return async ({ userDirectoryName, authChallenge }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const response = await respondToAuthChallengeChallenge(
      userPoolId,
      userPoolClientId,
      region,
      authChallenge.username,
      authChallenge.session,
      anyAuthChallengeToCognitoChallengeName(authChallenge),
      anyAuthChallengeToCognitoAttributes(authChallenge),
    );

    return actionResult(response);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.RespondToAuthChallenge]: getUserDirectoryRespondToAuthChallengeActionProcessor(qpqConfig),
  };
};
