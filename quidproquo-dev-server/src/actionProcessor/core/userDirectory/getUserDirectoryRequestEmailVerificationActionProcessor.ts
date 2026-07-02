import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRequestEmailVerificationActionProcessor,
} from 'quidproquo-core';
import { qpqWebServerUtils } from 'quidproquo-webserver';

import { resolveDevUsername } from '../../../logic/auth/devAuth';

const getProcessRequestEmailVerification = (_qpqConfig: QPQConfig): UserDirectoryRequestEmailVerificationActionProcessor => {
  return async ({ accessToken }) => {
    // No email is actually sent in dev
    const decoded = qpqWebServerUtils.unsafeDecodeJWTPayload<{ email?: string; username?: string; sub?: string }>(accessToken);

    return actionResult({
      attributeName: 'email',
      deliveryMedium: 'EMAIL',
      destination: resolveDevUsername(decoded?.email || decoded?.username || decoded?.sub),
    });
  };
};

export const getUserDirectoryRequestEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RequestEmailVerification]: getProcessRequestEmailVerification(qpqConfig),
});
