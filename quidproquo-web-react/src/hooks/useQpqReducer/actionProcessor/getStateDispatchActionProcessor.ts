import { ActionProcessorList, ActionProcessorListResolver, actionResult, StateActionType, StateDispatchActionProcessor } from 'quidproquo-core';

import { Dispatch } from 'react';

const getProcessStateDispatch =
  (dispatch: Dispatch<any>): StateDispatchActionProcessor<any> =>
  async ({ action }) => {
    dispatch(action);

    return actionResult(undefined);
  };

export const getStateDispatchActionListResolver =
  (dispatch: Dispatch<any>): ActionProcessorListResolver =>
  async (_qpqConfig, _dynamicModuleLoader): Promise<ActionProcessorList> => ({
    [StateActionType.Dispatch]: getProcessStateDispatch(dispatch),
  });
