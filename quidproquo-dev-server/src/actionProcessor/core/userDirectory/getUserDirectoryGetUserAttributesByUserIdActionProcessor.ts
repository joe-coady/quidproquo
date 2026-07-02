import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesByUserIdActionProcessor,
} from 'quidproquo-core';

import { createDevUserAttributes } from '../../../logic/auth/devAuth';

const getProcessGetUserAttributesByUserId = (_qpqConfig: QPQConfig): UserDirectoryGetUserAttributesByUserIdActionProcessor => {
  return async ({ userId }) => {
    return actionResult(createDevUserAttributes(userId));
  };
};

export const getUserDirectoryGetUserAttributesByUserIdActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributesByUserId]: getProcessGetUserAttributesByUserId(qpqConfig),
});
