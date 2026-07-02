import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetUserAttributesActionProcessor,
} from 'quidproquo-core';

const getProcessSetUserAttributes = (_qpqConfig: QPQConfig): UserDirectorySetUserAttributesActionProcessor => {
  return async () => {
    // User attributes are not stored in dev
    return actionResult(void 0);
  };
};

export const getUserDirectorySetUserAttributesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetUserAttributes]: getProcessSetUserAttributes(qpqConfig),
});
