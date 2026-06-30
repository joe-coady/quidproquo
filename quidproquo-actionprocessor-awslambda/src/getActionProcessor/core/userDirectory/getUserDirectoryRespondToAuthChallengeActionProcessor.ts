import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  AnyAuthChallenge,
  AuthenticateUserChallenge,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRespondToAuthChallengeActionProcessor,
  UserDirectoryRespondToAuthChallengeErrorTypeEnum,
} from 'quidproquo-core';

import { ChallengeNameType } from '@aws-sdk/client-cognito-identity-provider';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { respondToAuthChallengeChallenge } from '../../../logic/cognito/respondToAuthChallengeChallenge';
import { verifySoftwareToken } from '../../../logic/cognito/verifySoftwareToken';

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

    case AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA:
      return {
        SOFTWARE_TOKEN_MFA_CODE: authChallenge.mfaCode,
      };

    // MFA_SETUP completes with just USERNAME/SESSION — the TOTP code is consumed
    // by the preceding VerifySoftwareToken call, not by RespondToAuthChallenge.
    case AuthenticateUserChallenge.MFA_SETUP:
      return {};

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

    case AuthenticateUserChallenge.SOFTWARE_TOKEN_MFA:
      return ChallengeNameType.SOFTWARE_TOKEN_MFA;

    case AuthenticateUserChallenge.MFA_SETUP:
      return ChallengeNameType.MFA_SETUP;

    default:
      throw new Error(`Unknown challenge`);
  }
};

const getProcessRespondToAuthChallenge = (qpqConfig: QPQConfig): UserDirectoryRespondToAuthChallengeActionProcessor => {
  return async ({ userDirectoryName, authChallenge }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    // MFA_SETUP must verify the TOTP code first; Cognito returns a fresh session
    // that is then used to complete the challenge and issue tokens.
    let session = authChallenge.session;

    try {
      if (authChallenge.challenge === AuthenticateUserChallenge.MFA_SETUP) {
        session = await verifySoftwareToken(region, session, authChallenge.mfaCode);
      }

      const response = await respondToAuthChallengeChallenge(
        userPoolId,
        userPoolClientId,
        region,
        authChallenge.username,
        session,
        anyAuthChallengeToCognitoChallengeName(authChallenge),
        anyAuthChallengeToCognitoAttributes(authChallenge),
      );

      return actionResult(response);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        CodeMismatchException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.InvalidCode, 'The supplied code is incorrect'),
        EnableSoftwareTokenMFAException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.InvalidCode, 'The supplied code is incorrect'),
        ExpiredCodeException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.ExpiredCode, 'The supplied code has expired'),
        InvalidPasswordException: () =>
          actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.InvalidNewPassword, 'New password does not meet the password policy'),
        NotAuthorizedException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.Unauthorized, 'The challenge session is invalid or has expired'),
        LimitExceededException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
        TooManyRequestsException: () => actionResultError(UserDirectoryRespondToAuthChallengeErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryRespondToAuthChallengeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RespondToAuthChallenge]: getProcessRespondToAuthChallenge(qpqConfig),
});
