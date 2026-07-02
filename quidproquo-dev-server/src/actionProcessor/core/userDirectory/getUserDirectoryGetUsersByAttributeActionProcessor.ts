import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersByAttributeActionProcessor,
} from 'quidproquo-core';

import { createDevUserAttributes } from '../../../logic/auth/devAuth';

const getProcessGetUsersByAttribute = (_qpqConfig: QPQConfig): UserDirectoryGetUsersByAttributeActionProcessor => {
  return async ({ attribueName, attribueValue }) => {
    // Every lookup matches a single dev user, named after the searched value where it makes sense
    const username = attribueName === 'email' || attribueName === 'userId' ? attribueValue : undefined;

    return actionResult({
      items: [createDevUserAttributes(username)],
    });
  };
};

export const getUserDirectoryGetUsersByAttributeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsersByAttribute]: getProcessGetUsersByAttribute(qpqConfig),
});
