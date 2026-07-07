import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryAssociateSoftwareTokenActionProcessor,
} from 'quidproquo-core';

const getProcessAssociateSoftwareToken = (_qpqConfig: QPQConfig): UserDirectoryAssociateSoftwareTokenActionProcessor => {
  return async ({ session }) => {
    // Static base32 secret ~ MFA codes are never actually verified in dev
    return actionResult({
      secretCode: 'DEVDEVDEVDEVDEVD',
      session,
    });
  };
};

export const getUserDirectoryAssociateSoftwareTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.AssociateSoftwareToken]: getProcessAssociateSoftwareToken(qpqConfig),
});
