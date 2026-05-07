import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  askKeyValueStoreGet,
  createImplementationRuntime,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { StateMachineActionType, StateMachineGetActionProcessor } from '../actions';
import { getStateMachineByName } from '../config';

const getProcessStateMachineGet = (qpqConfig: QPQConfig): StateMachineGetActionProcessor<any> => {
  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
    const smConfig = getStateMachineByName(qpqConfig, payload.stateMachineName);
    if (!smConfig) {
      return actionResultError(ErrorTypeEnum.NotFound, `State machine not found: ${payload.stateMachineName}`);
    }

    const resolveStory = createImplementationRuntime(
      qpqConfig,
      ['StateMachine Get'],
      () => new Date().toISOString(),
      () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      session,
      actionProcessors,
      logger,
      dynamicModuleLoader,
      streamRegistry,
    );

    const getResult = await resolveStory(
      function* () { return yield* askKeyValueStoreGet<Record<string, any>>(smConfig.keyValueStoreName, payload.id); },
      [],
    );
    if (getResult.error) {
      return actionResultError(getResult.error.errorType, getResult.error.errorText);
    }

    const entity = getResult.result;
    if (!entity) {
      return actionResultError(ErrorTypeEnum.NotFound, `Entity not found: ${payload.id}`);
    }

    return actionResult(entity);
  };
};

export const getStateMachineGetActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [StateMachineActionType.Get]: getProcessStateMachineGet(qpqConfig),
});
