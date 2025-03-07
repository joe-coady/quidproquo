import { ActionProcessorList, ActionProcessorListResolver, actionResult, StateActionType, StateReadActionProcessor } from 'quidproquo-core';

const getProcessStateRead =
  <State>(getCurrentState: () => State): StateReadActionProcessor<any> =>
  async () => {
    return actionResult(getCurrentState());
  };

export const getStateReadActionListResolver =
  <State>(getCurrentState: () => State): ActionProcessorListResolver =>
  async (_qpqConfig, _dynamicModuleLoader): Promise<ActionProcessorList> => ({
    [StateActionType.Read]: getProcessStateRead(getCurrentState),
  });
