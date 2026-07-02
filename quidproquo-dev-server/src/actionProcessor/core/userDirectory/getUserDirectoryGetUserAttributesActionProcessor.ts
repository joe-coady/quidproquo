import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesActionProcessor,
} from 'quidproquo-core';

import { createDevUserAttributes } from '../../../logic/auth/devAuth';

const getProcessGetUserAttributes = (_qpqConfig: QPQConfig): UserDirectoryGetUserAttributesActionProcessor => {
  return async ({ username }) => {
    return actionResult(createDevUserAttributes(username));
  };
};

export const getUserDirectoryGetUserAttributesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributes]: getProcessGetUserAttributes(qpqConfig),
});
