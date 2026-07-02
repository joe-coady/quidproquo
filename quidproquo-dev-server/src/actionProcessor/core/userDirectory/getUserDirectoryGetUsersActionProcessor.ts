import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersActionProcessor,
} from 'quidproquo-core';

import { createDevUserAttributes } from '../../../logic/auth/devAuth';

const getProcessGetUsers = (_qpqConfig: QPQConfig): UserDirectoryGetUsersActionProcessor => {
  return async () => {
    return actionResult({
      items: [createDevUserAttributes()],
    });
  };
};

export const getUserDirectoryGetUsersActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsers]: getProcessGetUsers(qpqConfig),
});
