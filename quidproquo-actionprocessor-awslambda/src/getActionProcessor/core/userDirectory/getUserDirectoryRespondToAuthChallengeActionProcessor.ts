import {
  UserDirectoryRespondToAuthChallengeActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AnyAuthChallenge,
  AuthenticateUserChallenge,
} from 'quidproquo-core';

import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

import { respondToAuthChallengeChallenge } from '../../../logic/cognito/respondToAuthChallengeChallenge';

const anyAuthChallengeToCognitoAttributes = (
  authChallenge: AnyAuthChallenge,
): Record<string, string> => {
  switch (authChallenge.challenge) {
    case AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED:
      return {
        NEW_PASSWORD: authChallenge.newPassword,
      };

    default:
      return {};
  }
};

const getUserDirectoryRespondToAuthChallengeActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryRespondToAuthChallengeActionProcessor => {
  return async ({ userDirectoryName, authChallenge }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const response = await respondToAuthChallengeChallenge(
      userPoolId,
      userPoolClientId,
      region,
      authChallenge.username,
      authChallenge.session,
      anyAuthChallengeToCognitoAttributes(authChallenge),
    );

    return actionResult(response);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.RespondToAuthChallenge]:
      getUserDirectoryRespondToAuthChallengeActionProcessor(qpqConfig),
  };
};
